/**
 * Pranora Master E2E Test Runner (REL-1)
 * Owner: Afridi | Sprint: S7
 *
 * Runs all critical flow test suites, verifies coverage and exit status:
 * 1. Auth, Phone OTP & Multi-role verification (AUTH-1, AUTH-5)
 * 2. Spatial Vet Discovery & Emergency Mode (MAP-1, MAP-7)
 * 3. Appointment Booking & Cash Payment (APT-1, APT-3, PAY-1)
 * 4. Urgent Rescue, 15-min SLA & Case Closure (RSC-1, RSC-6, RSC-7)
 * 5. Adoption Application, Review & Handover (ADP-1, ADP-3, ADP-5, ADP-6)
 * 6. Pet Vaccine Schedule, Notes & SMS Reminders (HLT-1, HLT-7, HLT-2, HLT-6)
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_FILES = [
  'auth-roles.e2e.test.ts',
  'vet-discovery.e2e.test.ts',
  'booking-lifecycle.e2e.test.ts',
  'rescue-lifecycle.e2e.test.ts',
  'adoption-handover.e2e.test.ts',
  'health-reminders.e2e.test.ts',
];

console.log('============================================================');
console.log('🚀 Pranora E2E Test Suite (REL-1) — Critical Flows');
console.log('============================================================\n');

let totalPassed = 0;
let totalFailed = 0;
const results: Array<{ file: string; passed: boolean; duration: number }> = [];

for (const file of TEST_FILES) {
  const filePath = path.join(__dirname, file);
  const startTime = Date.now();

  const child = spawn(
    process.execPath,
    ['--experimental-strip-types', '--test', filePath],
    { stdio: 'inherit' }
  );

  const exitCode: number = await new Promise((resolve) => {
    child.on('close', resolve);
  });

  const duration = Date.now() - startTime;
  if (exitCode === 0) {
    totalPassed++;
    results.push({ file, passed: true, duration });
  } else {
    totalFailed++;
    results.push({ file, passed: false, duration });
  }
}

console.log('\n============================================================');
console.log('📊 E2E Test Execution Summary:');
console.log('============================================================');
for (const res of results) {
  const statusIcon = res.passed ? '✅ PASS' : '❌ FAIL';
  console.log(`  ${statusIcon} ${res.file} (${res.duration}ms)`);
}
console.log('------------------------------------------------------------');
console.log(`Total: ${TEST_FILES.length} flows | Passed: ${totalPassed} | Failed: ${totalFailed}`);
console.log('============================================================\n');

if (totalFailed > 0) {
  process.exit(1);
} else {
  console.log('🎉 All critical flow E2E tests PASSED successfully!\n');
  process.exit(0);
}
