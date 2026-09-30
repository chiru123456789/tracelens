export type SourceContext = {
  file: string;
  line: number;
  startLine: number;
  endLine: number;
  lines: {
    number: number;
    code: string;
    isTarget: boolean;
  }[];
};

export type Diagnosis = {
  title: string;
  cause: string;
  evidence: string;
  confidence: "high" | "medium" | "low";
};

export type FixSuggestion = {
  title: string;
  explanation: string;
  before: string;
  after: string;
  confidence: "high" | "medium" | "low";
};

const DEMO_SOURCES: Record<string, string> = {
  "PaymentService.java": `package com.example;

public class PaymentService {

    public PaymentMethod processPayment(Customer customer) {
        PaymentMethod method = customer.getPaymentMethod();

        if (method == null) {
            throw new PaymentException("Payment method missing");
        }

        return method;
    }

    public void refundPayment(Customer customer) {
        // refund implementation
    }
}`,

  "OrderService.java": `package com.example;

public class OrderService {

    public Order createOrder(Customer customer) {
        Order order = new Order();
        order.setCustomer(customer);

        return order;
    }

    public void cancelOrder(Order order) {
        order.cancel();
    }
}`,

  "AuthController.java": `package com.example;

public class AuthController {

    public Response login(Request request) {
        User user = authService.authenticate(request);

        return Response.ok(user);
    }
}`,
};

export function inspectSource(
  file: string,
  line: number,
  contextLines = 3,
): SourceContext | null {
  const source = DEMO_SOURCES[file];

  if (!source) return null;

  const sourceLines = source.split("\n");

  if (line < 1 || line > sourceLines.length) return null;

  const startLine = Math.max(1, line - contextLines);
  const endLine = Math.min(sourceLines.length, line + contextLines);

  const lines = [];

  for (let number = startLine; number <= endLine; number++) {
    lines.push({
      number,
      code: sourceLines[number - 1] ?? "",
      isTarget: number === line,
    });
  }

  return {
    file,
    line,
    startLine,
    endLine,
    lines,
  };
}

export function diagnose(
  errorType: string,
  source: SourceContext | null,
): Diagnosis {
  if (!source) {
    return {
      title: "Source unavailable",
      cause:
        "TraceLens found the failure location but could not inspect the corresponding source code.",
      evidence: "No matching source file was available.",
      confidence: "low",
    };
  }

  const target = source.lines.find((line) => line.isTarget);
  const code = target?.code.trim() ?? "";

  if (
    errorType === "NullPointerException" &&
    (code.includes("customer.") ||
      code.includes("request.") ||
      code.includes("user.") ||
      code.includes("order."))
  ) {
    const objectName =
      code.match(/\b(customer|request|user|order)\b/)?.[1] ?? "object";

    return {
      title: "Possible null dereference",
      cause: `The code accesses ${objectName} without first proving that it is non-null.`,
      evidence: `${source.file}:${source.line} → ${code}`,
      confidence: "high",
    };
  }

  if (
    errorType === "IllegalStateException" &&
    (code.includes("throw") || code.includes("state"))
  ) {
    return {
      title: "Invalid application state",
      cause:
        "The failing path reaches an operation that expects a valid application state.",
      evidence: `${source.file}:${source.line} → ${code}`,
      confidence: "medium",
    };
  }

  return {
    title: "Failure requires deeper inspection",
    cause:
      "TraceLens located the failing source line, but the current deterministic rules do not have enough evidence to classify the root cause.",
    evidence: `${source.file}:${source.line} → ${code || "source line unavailable"}`,
    confidence: "low",
  };
}

export function generateFix(
  errorType: string,
  source: SourceContext | null,
  diagnosis: Diagnosis | null,
): FixSuggestion | null {
  if (!source || !diagnosis) return null;

  const target = source.lines.find((line) => line.isTarget);
  const code = target?.code.trim() ?? "";

  if (
    errorType === "NullPointerException" &&
    code === "PaymentMethod method = customer.getPaymentMethod();"
  ) {
    return {
      title: "Guard customer before access",
      explanation:
        "The failing expression dereferences customer. Add an explicit null check before calling getPaymentMethod(), so invalid input fails with a controlled exception instead of a NullPointerException.",
      before: `PaymentMethod method = customer.getPaymentMethod();`,
      after: `if (customer == null) {
    throw new IllegalArgumentException("customer cannot be null");
}

PaymentMethod method = customer.getPaymentMethod();`,
      confidence: "high",
    };
  }

  if (
    errorType === "NullPointerException" &&
    /^(customer|request|user|order)\./.test(code)
  ) {
    const objectName = code.split(".")[0];

    return {
      title: `Guard ${objectName} before access`,
      explanation: `The failing line dereferences ${objectName}. Add a null check before the access so the failure is handled explicitly.`,
      before: target?.code.trim() ?? code,
      after: `if (${objectName} == null) {
    throw new IllegalArgumentException("${objectName} cannot be null");
}

${target?.code.trim() ?? code}`,
      confidence: "medium",
    };
  }

  return {
    title: "No automatic patch available",
    explanation:
      "TraceLens has identified the failure evidence, but the current deterministic fix engine does not have enough information to safely generate a code change.",
    before: code || "Source line unavailable",
    after: "Manual investigation required.",
    confidence: "low",
  };
}