"use client";

import { useState } from "react";

type Screen =
  | "dashboard"
  | "analysis"
  | "diagnosis"
  | "fix"
  | "verify"
  | "success";

const investigations = [
  {
    file: "PaymentService.java",
    line: "Line 47",
    status: "Resolved",
    type: "NullPointerException",
  },
  {
    file: "AuthController.java",
    line: "Line 82",
    status: "Open",
    type: "AuthenticationError",
  },
  {
    file: "DatabaseClient.ts",
    line: "Line 116",
    status: "Resolved",
    type: "ConnectionError",
  },
];

const captureOptions = [
  "Import log",
  "Capture screenshot",
  "Voice description",
];

export default function Home() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [showCapture, setShowCapture] = useState(false);
  const [trace, setTrace] = useState("");

  function startAnalysis() {
    if (!trace.trim()) return;

    setShowCapture(false);
    setScreen("analysis");

    setTimeout(() => {
      setScreen("diagnosis");
    }, 1400);
  }

  function reset() {
    setTrace("");
    setScreen("dashboard");
  }

  return (
    <main className="min-h-screen bg-[#07090d] text-white">
      {screen === "dashboard" && (
        <Dashboard
          onCapture={() => setShowCapture(true)}
          onPaste={() => setShowCapture(true)}
        />
      )}

      {screen === "analysis" && (
        <Analysis trace={trace} />
      )}

      {screen === "diagnosis" && (
        <Diagnosis
          onFix={() => setScreen("fix")}
          onBack={() => setScreen("dashboard")}
        />
      )}

      {screen === "fix" && (
        <Fix
          onVerify={() => setScreen("verify")}
          onBack={() => setScreen("diagnosis")}
        />
      )}

      {screen === "verify" && (
        <Verify
          onSuccess={() => setScreen("success")}
          onBack={() => setScreen("fix")}
        />
      )}

      {screen === "success" && <Success onReset={reset} />}

      {showCapture && (
        <CaptureModal
          trace={trace}
          setTrace={setTrace}
          onClose={() => setShowCapture(false)}
          onAnalyze={startAnalysis}
        />
      )}
    </main>
  );
}

/* ---------------- Dashboard ---------------- */

function Dashboard({
  onCapture,
  onPaste,
}: {
  onCapture: () => void;
  onPaste: () => void;
}) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
      <Header />

      <section className="py-20 text-center sm:py-28">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-emerald-400">
          Failure → Cause → Fix → Verify
        </p>

        <h1 className="mx-auto max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
          Understand failures.
          <br />
          <span className="text-zinc-500">Fix faster.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base">
          TraceLens turns errors, logs, screenshots, and stack traces into a
          clear debugging path from failure to verified fix.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            onClick={onCapture}
            className="rounded-lg bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            Capture an Error
          </button>

          <button
            onClick={onPaste}
            className="rounded-lg border border-zinc-800 px-5 py-3 text-sm text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900"
          >
            Paste Trace
          </button>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-zinc-200">
              Recent investigations
            </h2>
            <p className="mt-1 text-xs text-zinc-600">
              Your latest debugging sessions
            </p>
          </div>

          <span className="font-mono text-xs text-zinc-600">03</span>
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
          {investigations.map((item, index) => (
            <div
              key={item.file}
              className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between ${
                index !== investigations.length - 1
                  ? "border-b border-zinc-800"
                  : ""
              }`}
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-zinc-200">
                    {item.file}
                  </span>

                  <span className="font-mono text-xs text-zinc-600">
                    {item.line}
                  </span>
                </div>

                <p className="mt-1 text-xs text-zinc-600">{item.type}</p>
              </div>

              <span
                className={`w-fit rounded-full px-2.5 py-1 text-xs ${
                  item.status === "Resolved"
                    ? "bg-emerald-400/10 text-emerald-400"
                    : "bg-amber-400/10 text-amber-400"
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20">
        <div className="grid gap-3 sm:grid-cols-5">
          {["Capture", "Analyze", "Trace", "Fix", "Verify"].map(
            (step, index) => (
              <div
                key={step}
                className="rounded-lg border border-zinc-800 bg-zinc-950 p-4"
              >
                <span className="font-mono text-xs text-zinc-600">
                  0{index + 1}
                </span>

                <p className="mt-8 text-sm text-zinc-300">{step}</p>
              </div>
            ),
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ---------------- Analysis ---------------- */

function Analysis({ trace }: { trace: string }) {
  return (
    <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
      <Header />

      <section className="py-20">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
          Analysis
        </p>

        <h1 className="mt-3 text-3xl font-semibold">
          Tracing your failure...
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
          TraceLens is parsing the evidence and mapping the failure to its
          likely source.
        </p>

        <div className="mt-10 space-y-3">
          {[
            "Evidence captured",
            "Stack trace parsed",
            "Source location identified",
            "Root cause analysis",
          ].map((step, index) => (
            <div
              key={step}
              className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-4"
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs ${
                  index < 2
                    ? "bg-emerald-400/10 text-emerald-400"
                    : "bg-zinc-800 text-zinc-500"
                }`}
              >
                {index < 2 ? "✓" : "•"}
              </span>

              <span className="text-sm text-zinc-300">{step}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-zinc-800 bg-black/30 p-5">
          <p className="mb-3 text-xs uppercase tracking-wider text-zinc-600">
            Captured evidence
          </p>

          <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-6 text-zinc-500">
            {trace}
          </pre>
        </div>
      </section>
    </div>
  );
}

/* ---------------- Diagnosis ---------------- */

function Diagnosis({
  onFix,
  onBack,
}: {
  onFix: () => void;
  onBack: () => void;
}) {
  return (
    <InvestigationShell
      label="Diagnosis"
      onBack={onBack}
    >
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <p className="font-mono text-xs text-zinc-600">
            PAYMENT SERVICE
          </p>

          <h1 className="mt-3 text-3xl font-semibold">
            NullPointerException
          </h1>

          <div className="mt-3 flex gap-3 font-mono text-xs">
            <span className="text-red-400">PaymentService.java:47</span>
            <span className="text-zinc-700">•</span>
            <span className="text-zinc-500">94% confidence</span>
          </div>

          <div className="mt-10 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <p className="text-xs uppercase tracking-wider text-zinc-600">
              Root cause
            </p>

            <p className="mt-4 text-sm leading-7 text-zinc-300">
              <code className="rounded bg-zinc-900 px-1.5 py-1 font-mono text-xs text-emerald-400">
                customer
              </code>{" "}
              can be null before{" "}
              <code className="rounded bg-zinc-900 px-1.5 py-1 font-mono text-xs text-emerald-400">
                getPaymentMethod()
              </code>{" "}
              is called.
            </p>

            <p className="mt-4 text-sm leading-7 text-zinc-500">
              The failure originates at line 47 because the payment flow does
              not validate the customer object before accessing it.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
          <p className="text-xs uppercase tracking-wider text-zinc-600">
            Failure path
          </p>

          <div className="mt-5 space-y-3">
            {[
              "PaymentController.java:23",
              "PaymentService.java:42",
              "PaymentService.java:47",
            ].map((location, index) => (
              <div key={location} className="flex gap-3">
                <span className="font-mono text-xs text-zinc-700">
                  0{index + 1}
                </span>

                <span
                  className={`font-mono text-xs ${
                    index === 2 ? "text-red-400" : "text-zinc-500"
                  }`}
                >
                  {location}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onFix}
        className="mt-8 w-full rounded-lg bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
      >
        Generate suggested fix →
      </button>
    </InvestigationShell>
  );
}

/* ---------------- Fix ---------------- */

function Fix({
  onVerify,
  onBack,
}: {
  onVerify: () => void;
  onBack: () => void;
}) {
  return (
    <InvestigationShell
      label="Suggested Fix"
      onBack={onBack}
    >
      <div className="mb-8">
        <p className="font-mono text-xs text-zinc-600">
          PAYMENT SERVICE / LINE 47
        </p>

        <h1 className="mt-3 text-3xl font-semibold">
          Prevent the null access.
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500">
          TraceLens recommends validating the customer before attempting to
          access payment information.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#05070a]">
        <div className="border-b border-zinc-800 px-4 py-3">
          <span className="font-mono text-xs text-zinc-600">
            PaymentService.java
          </span>
        </div>

        <pre className="overflow-x-auto p-5 font-mono text-xs leading-7">
          <code>
            <span className="text-zinc-600">45</span>{"  "}
            <span className="text-zinc-500">
              PaymentMethod method = customer.getPaymentMethod();
            </span>
            {"\n"}
            <span className="text-red-400">46 -</span>{"  "}
            <span className="text-red-300/70">
              PaymentMethod method = customer.getPaymentMethod();
            </span>
            {"\n"}
            <span className="text-emerald-400">46 +</span>{"  "}
            <span className="text-emerald-300">
              if (customer == null) throw new IllegalArgumentException(
            </span>
            {"\n"}
            <span className="text-emerald-400">47 +</span>{"  "}
            <span className="text-emerald-300">
              {"    \"Customer is required\""}
            </span>
            {"\n"}
            <span className="text-emerald-400">48 +</span>{"  "}
            <span className="text-emerald-300">
              );
            </span>
            {"\n"}
            <span className="text-emerald-400">49 +</span>{"  "}
            <span className="text-emerald-300">
              PaymentMethod method = customer.getPaymentMethod();
            </span>
          </code>
        </pre>
      </div>

      <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
        <p className="text-xs uppercase tracking-wider text-zinc-600">
          Why this fix
        </p>

        <p className="mt-3 text-sm leading-6 text-zinc-400">
          The guard converts an unexpected null dereference into an explicit
          validation failure that can be handled by the caller.
        </p>
      </div>

      <button
        onClick={onVerify}
        className="mt-8 w-full rounded-lg bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
      >
        Generate verification test →
      </button>
    </InvestigationShell>
  );
}

/* ---------------- Verification ---------------- */

function Verify({
  onSuccess,
  onBack,
}: {
  onSuccess: () => void;
  onBack: () => void;
}) {
  return (
    <InvestigationShell
      label="Verification"
      onBack={onBack}
    >
      <p className="font-mono text-xs text-zinc-600">
        GENERATED TEST SUITE
      </p>

      <h1 className="mt-3 text-3xl font-semibold">
        Verify the proposed fix.
      </h1>

      <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-500">
        TraceLens generated tests covering the failure condition and the normal
        payment path.
      </p>

      <div className="mt-10 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <span className="font-mono text-xs text-zinc-500">
            PaymentServiceTest.java
          </span>

          <span className="text-xs text-emerald-400">
            3 / 3 passed
          </span>
        </div>

        <div className="divide-y divide-zinc-900">
          {[
            "rejects null customer",
            "accepts valid customer",
            "returns expected payment method",
          ].map((test) => (
            <div
              key={test}
              className="flex items-center gap-3 px-5 py-4"
            >
              <span className="text-emerald-400">✓</span>

              <span className="font-mono text-xs text-zinc-400">
                {test}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onSuccess}
        className="mt-8 w-full rounded-lg bg-emerald-400 px-4 py-3 text-sm font-medium text-black transition hover:bg-emerald-300"
      >
        Mark investigation resolved →
      </button>
    </InvestigationShell>
  );
}

/* ---------------- Success ---------------- */

function Success({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/10 text-2xl text-emerald-400">
          ✓
        </div>

        <p className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-emerald-400">
          Investigation resolved
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight">
          Failure traced.
          <br />
          Fix verified.
        </h1>

        <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-zinc-500">
          TraceLens connected the failure to its source, explained the root
          cause, proposed a fix, and verified it with generated tests.
        </p>

        <div className="mt-10 grid grid-cols-4 gap-2">
          {["Captured", "Traced", "Fixed", "Verified"].map((step) => (
            <div
              key={step}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-4"
            >
              <div className="text-emerald-400">✓</div>
              <p className="mt-2 text-xs text-zinc-500">{step}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onReset}
          className="mt-10 rounded-lg border border-zinc-800 px-5 py-3 text-sm text-zinc-300 transition hover:bg-zinc-900"
        >
          Back to TraceLens
        </button>
      </div>
    </div>
  );
}

/* ---------------- Capture Modal ---------------- */

function CaptureModal({
  trace,
  setTrace,
  onClose,
  onAnalyze,
}: {
  trace: string;
  setTrace: (value: string) => void;
  onClose: () => void;
  onAnalyze: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-[#0b0e13] p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-medium">Capture an error</h2>

            <p className="mt-1 text-sm text-zinc-500">
              Give TraceLens the failure evidence.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-600 hover:text-zinc-300"
          >
            ✕
          </button>
        </div>

        <textarea
          value={trace}
          onChange={(event) => setTrace(event.target.value)}
          placeholder="Paste your stack trace here..."
          className="mt-6 h-40 w-full resize-none rounded-lg border border-zinc-800 bg-black/40 p-4 font-mono text-xs text-zinc-300 outline-none placeholder:text-zinc-700 focus:border-zinc-600"
        />

        <button
          onClick={onAnalyze}
          disabled={!trace.trim()}
          className="mt-3 w-full rounded-lg bg-white px-4 py-3 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Analyze failure
        </button>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {captureOptions.map((option) => (
            <button
              key={option}
              className="rounded-lg border border-zinc-800 px-3 py-3 text-xs text-zinc-500 transition hover:bg-zinc-900"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Shared UI ---------------- */

function Header() {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

        <span className="text-sm font-medium tracking-wide text-zinc-300">
          TraceLens
        </span>
      </div>

      <div className="rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-500">
        Developer Tools
      </div>
    </header>
  );
}

function InvestigationShell({
  label,
  onBack,
  children,
}: {
  label: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
      <Header />

      <div className="mt-12 flex items-center justify-between border-b border-zinc-900 pb-5">
        <button
          onClick={onBack}
          className="text-sm text-zinc-500 transition hover:text-zinc-200"
        >
          ← Back
        </button>

        <span className="font-mono text-xs uppercase tracking-wider text-zinc-600">
          {label}
        </span>
      </div>

      <section className="py-12">{children}</section>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-700">
      TraceLens · Developer debugging, traced end-to-end.
    </footer>
  );
}