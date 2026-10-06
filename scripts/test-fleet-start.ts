import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { PATCH } from "../app/api/tenants/[tenant]/initiatives/[id]/route";
import { RoadmapRepository } from "../lib/db";
import {
  createOperatorSession,
  operatorSessionCookieName,
} from "../lib/operator-auth";
import { tenantEnvironmentKey } from "../lib/tenant-env";
import { RoadmapInitiative, Tenant } from "../lib/types";

const tenantId = "acme";
const initiative: RoadmapInitiative = {
  id: "init-fleet-test",
  tenant_id: tenantId,
  title: "Fleet start test",
  stage: "backlog",
  theme: "Core AI & Retrieval",
  priority: "P1 - High",
  target_persona: "AI Engineer",
  quarter: "In Backlog",
  summary: "Test Fleet dispatch from Ready for dev.",
  problem_statement: "",
  user_story: "",
  success_metrics: [],
  acceptance_criteria: ["Dispatch an MCP start request."],
  technical_architecture: "",
  rice: { reach: 50, impact: 3, confidence: 80, effort: 3, score: 40 },
  upvotes: 0,
  tags: [],
};

async function runTest() {
  const originalFetch = globalThis.fetch;
  const originalGetInitiative = RoadmapRepository.getInitiative;
  const originalUpdateInitiative = RoadmapRepository.updateInitiative;
  const originalGetTenant = RoadmapRepository.getTenant;
  const originalReportFleetStatus = RoadmapRepository.reportFleetStatus;
  const envKeys = [
    tenantEnvironmentKey("AROADMAP_OPERATOR_PASSWORD", tenantId),
    tenantEnvironmentKey("AROADMAP_OPERATOR_SESSION_SECRET", tenantId),
    tenantEnvironmentKey("AROADMAP_MCP_URL", tenantId),
    tenantEnvironmentKey("AROADMAP_TRIGGER_TOKEN", tenantId),
  ];
  const previousEnvironment = envKeys.map((key) => process.env[key]);
  const fetchPayloads: Record<string, unknown>[] = [];
  const fetchAuthorizationHeaders: string[] = [];
  let fleetResponse: Record<string, unknown> = { result: { status: "dispatching" } };

  process.env[envKeys[0]] = "test-operator-password-with-at-least-32-bytes";
  process.env[envKeys[1]] = "test-session-secret-with-at-least-32-bytes";
  process.env[envKeys[2]] = "https://mcp.example.test";
  process.env[envKeys[3]] = "test-token";

  RoadmapRepository.getInitiative = async () => ({ ...initiative });
  RoadmapRepository.updateInitiative = async (_tenantId, _id, updates) => {
    Object.assign(initiative, updates);
    return initiative;
  };
  RoadmapRepository.getTenant = async (): Promise<Tenant> => ({
    id: tenantId,
    name: "Acme",
    subdomain: tenantId,
    github_repo: "acme/product",
  });
  RoadmapRepository.reportFleetStatus = async () => ({ status: "accepted" });
  globalThis.fetch = async (_input, init) => {
    fetchPayloads.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
    fetchAuthorizationHeaders.push(new Headers(init?.headers).get("authorization") || "");
    return new Response(JSON.stringify(fleetResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    const session = createOperatorSession(tenantId);
    const params = { params: Promise.resolve({ tenant: tenantId, id: initiative.id }) };
    const makeRequest = () =>
      new NextRequest(`https://aroadmap.test/api/tenants/${tenantId}/initiatives/${initiative.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `${operatorSessionCookieName(tenantId)}=${session.value}`,
        },
        body: JSON.stringify({
          stage: "ready_for_dev",
          quarter: "In Backlog",
          request_id: "fleet-start-test-request",
        }),
      });

    initiative.stage = "backlog";
    const success = await PATCH(makeRequest(), params);
    const successBody = await success.json();
    assert.equal(success.status, 200);
    assert.equal(successBody.stage, "ready_for_dev");
    assert.equal(successBody.request_id, "fleet-start-test-request");
    assert.equal(initiative.stage, "ready_for_dev");
    const fleetArguments = (
      fetchPayloads[0].params as {
        arguments: { event_type: string; github_repository: string };
      }
    ).arguments;
    assert.equal(
      fleetArguments.event_type,
      "mcp_start_dev"
    );
    assert.equal(fleetArguments.github_repository, "acme/product");
    assert.equal(fetchAuthorizationHeaders[0], "Bearer test-token");

    initiative.stage = "backlog";
    fleetResponse = { result: { isError: true, error: "Fleet dispatch failed." } };
    const failed = await PATCH(makeRequest(), params);
    const failedBody = await failed.json();
    assert.equal(failed.status, 409);
    assert.match(failedBody.error, /Fleet dispatch failed/);
    assert.equal(initiative.stage, "backlog");

    console.log("Fleet start route tests passed.");
  } finally {
    globalThis.fetch = originalFetch;
    RoadmapRepository.getInitiative = originalGetInitiative;
    RoadmapRepository.updateInitiative = originalUpdateInitiative;
    RoadmapRepository.getTenant = originalGetTenant;
    RoadmapRepository.reportFleetStatus = originalReportFleetStatus;
    envKeys.forEach((key, index) => {
      if (previousEnvironment[index] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = previousEnvironment[index];
      }
    });
  }
}

runTest().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
