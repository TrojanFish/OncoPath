import { runAllGuardrailTests } from '../src/lib/guardrailVerification';

console.log('=== OncoPath Production Readiness & Guardrails Test ===\n');

const results = runAllGuardrailTests();
let allPassed = true;

for (const res of results) {
  const icon = res.passed ? '✅ [PASS]' : '❌ [FAIL]';
  console.log(`${icon} [${res.suite}] - ${res.name}`);
  console.log(`   Message: ${res.message}`);
  if (!res.passed) {
    allPassed = false;
  }
}

console.log('\n----------------------------------------------------');
if (allPassed) {
  console.log('🎉 ALL GUARDRAILS & SAFETY TESTS PASSED! System is ready for production.\n');
  process.exit(0);
} else {
  console.error('⚠️ SOME TESTS FAILED. Please review the output above.\n');
  process.exit(1);
}
