import fs from "fs";
import path from "path";
import { parseStringPromise } from "xml2js";

// Usage:
// 1. bun test --reporter=junit > junit.xml
// 2. bun run scripts/test-report-junit.ts

const junitPath = path.join(process.cwd(), "test/junit.xml");
const readmePath = path.join(process.cwd(), "test/README.md");

if (!fs.existsSync(junitPath) || !fs.existsSync(readmePath)) {
  console.error("Missing junit.xml or README.md");
  process.exit(1);
}

async function main() {
  const xml = fs.readFileSync(junitPath, "utf-8");
  const parsed = await parseStringPromise(xml);

  // JUnit XML structure: testsuites > testsuite[] > testcase[]
  const results: { name: string; status: string }[] = [];
  const suites = parsed.testsuites?.testsuite || [];
  for (const suite of suites) {
    const suiteName = suite.$?.name || "";
    const testcases = suite.testcase || [];
    for (const testcase of testcases) {
      const name = (suiteName ? suiteName + " > " : "") + (testcase.$?.name || "");
      const status = testcase.failure ? "fail" : "pass";
      results.push({ name, status });
    }
  }

  let readme = fs.readFileSync(readmePath, "utf-8");
  readme = readme.replace(
    /<!-- TEST_RESULTS_START -->(.|\n|\r)*?<!-- TEST_RESULTS_END -->/gm,
    ""
  );

  const total = results.length;
  const passed = results.filter((r) => r.status === "pass").length;
  const table = `<!-- TEST_RESULTS_START -->
## Test Results

| Test Name | Status |
|-----------|--------|
${results
    .map(
      (r) =>
        `| ${r.name} | ${r.status === "pass" ? "✅ Pass" : "❌ Fail"} |`
    )
    .join("\n")}
| **Total** | ${passed} / ${total} passed |
<!-- TEST_RESULTS_END -->
`;

  readme += "\n" + table;
  fs.writeFileSync(readmePath, readme);
}

main();
