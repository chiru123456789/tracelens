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