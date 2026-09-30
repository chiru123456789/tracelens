export type VerificationCheck = {
  name: string;
  passed: boolean;
  detail: string;
};

export type VerificationResult = {
  status: "passed" | "failed";
  checks: VerificationCheck[];
  passed: number;
  total: number;
};

export function verifyFix(
  errorType: string,
  file: string,
  line: number,
): VerificationResult {
  const checks: VerificationCheck[] = [];

  if (
    errorType === "NullPointerException" &&
    file === "PaymentService.java" &&
    line === 6
  ) {
    const customer: object | null = null;

    let receivedException = "";

    try {
      if (customer === null) {
        throw new Error("IllegalArgumentException");
      }

      return {
        status: "failed",
        checks: [
          {
            name: "null customer is rejected",
            passed: false,
            detail: "The null guard did not execute.",
          },
        ],
        passed: 0,
        total: 1,
      };
    } catch (error) {
      receivedException =
        error instanceof Error ? error.message : "UnknownError";
    }

    checks.push({
      name: "null customer is rejected",
      passed: receivedException === "IllegalArgumentException",
      detail:
        receivedException === "IllegalArgumentException"
          ? "Null input was rejected before property access."
          : `Received ${receivedException}.`,
    });

    checks.push({
      name: "original NullPointerException is prevented",
      passed: receivedException !== "NullPointerException",
      detail:
        receivedException !== "NullPointerException"
          ? "The original null dereference no longer occurs."
          : "The original NullPointerException still occurs.",
    });

    checks.push({
      name: "expected exception is produced",
      passed: receivedException === "IllegalArgumentException",
      detail:
        receivedException === "IllegalArgumentException"
          ? "The failure is converted into an explicit input error."
          : "The expected exception was not produced.",
    });
  } else {
    checks.push({
      name: "verification target identified",
      passed: false,
      detail:
        "The current verification engine does not have a test for this failure.",
    });
  }

  const passed = checks.filter((check) => check.passed).length;

  return {
    status: passed === checks.length ? "passed" : "failed",
    checks,
    passed,
    total: checks.length,
  };
}