"use client";

import { useState } from "react";
import { parseTrace, type ParsedTrace } from "@/lib/trace-parser";
import { inspectSource, type SourceContext } from "@/lib/source-inspector";

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
    line: "47",
    status: "Resolved",
    type: "NullPointerException",
    time: "2m ago",
  },
  {
    file: "AuthController.java",
    line: "82",
    status: "Open",
    type: "AuthenticationError",
    time: "18m ago",
  },
  {
    file: "DatabaseClient.ts",
    line: "116",
    status: "Resolved",
    type: "ConnectionError",
    time: "1h ago",
  },
];

export default function Home() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [showCapture, setShowCapture] = useState(false);
  const [trace, setTrace] = useState("");
  const [parsedTrace, setParsedTrace] = useState<ParsedTrace | null>(null);
  const [sourceContext, setSourceContext] = useState<SourceContext | null>(
    null,
  );

  function startAnalysis() {
    if (!trace.trim()) return;

    const parsed = parseTrace(trace);
    const primaryFrame = parsed.frames[0];

    setParsedTrace(parsed);

    if (primaryFrame) {
      setSourceContext(
        inspectSource(primaryFrame.file, primaryFrame.line),
      );
    } else {
      setSourceContext(null);
    }

    setShowCapture(false);
    setScreen("analysis");

    setTimeout(() => setScreen("diagnosis"), 1400);
  }

  function reset() {
    setTrace("");
    setParsedTrace(null);
    setSourceContext(null);
    setScreen("dashboard");
  }

  return (
    <main className="min-h-screen bg-[#05070a] text-white">
      {screen === "dashboard" && (
        <Dashboard
          onCapture={() => setShowCapture(true)}
          onPaste={() => setShowCapture(true)}
        />
      )}

      {screen === "analysis" && <Analysis trace={trace} />}

      {screen === "diagnosis" && (
        <Diagnosis
          parsedTrace={parsedTrace}
          sourceContext={sourceContext}
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

function Dashboard({
  onCapture,
  onPaste,
}: {
  onCapture: () => void;
  onPaste: () => void;
}) {
  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-4 sm:px-8 sm:py-8">
      <Header />

      <div className="mt-5 flex items-center gap-2 rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 font-mono text-[10px] text-zinc-600">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        TRACE ENGINE
        <span className="text-zinc-800">/</span>
        READY
        <span className="ml-auto">LOCAL SESSION</span>
      </div>

      <section className="py-16 sm:py-24">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-emerald-400">
          Developer debugging system
        </p>

        <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          Understand failures.
          <br />
          <span className="text-zinc-600">Fix faster.</span>
        </h1>

        <p className="mt-6 max-w-xl text-sm leading-7 text-zinc-500 sm:text-base">
          Capture a failure. Trace it to the source. Understand the cause.
          Verify the fix.
        </p>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={onCapture}
            className="rounded-lg bg-white px-5 py-3 text-sm font-medium text-black hover:bg-zinc-200"
          >
            + Capture an error
          </button>

          <button
            onClick={onPaste}
            className="rounded-lg border border-zinc-800 px-5 py-3 text-sm text-zinc-400 hover:bg-zinc-900"
          >
            Paste stack trace
          </button>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2 sm:gap-3">
        <Stat label="Investigations" value="03" />
        <Stat label="Resolved" value="02" />
        <Stat label="Verified" value="02" />
      </section>

      <section className="mt-12">
        <p className="text-sm font-medium text-zinc-200">
          Recent investigations
        </p>

        <p className="mt-1 text-xs text-zinc-600">
          Latest failures traced by TraceLens
        </p>

        <div className="mt-4 overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
          {investigations.map((item, index) => (
            <div
              key={item.file}
              className={`px-4 py-4 sm:px-5 ${
                index !== investigations.length - 1
                  ? "border-b border-zinc-900"
                  : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-1.5 h-1.5 w-1.5 rounded-full ${
                    item.status === "Resolved"
                      ? "bg-emerald-400"
                      : "bg-amber-400"
                  }`}
                />

                <div className="min-w-0 flex-1">
                  <div className="flex gap-3">
                    <span className="truncate font-mono text-xs text-zinc-300">
                      {item.file}
                    </span>

                    <span className="font-mono text-[10px] text-zinc-700">
                      :{item.line}
                    </span>
                  </div>

                  <div className="mt-1 flex gap-3">
                    <span className="text-[10px] text-zinc-600">
                      {item.type}
                    </span>

                    <span className="text-[10px] text-zinc-800">
                      {item.time}
                    </span>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2 py-1 text-[9px] ${
                    item.status === "Resolved"
                      ? "bg-emerald-400/10 text-emerald-400"
                      : "bg-amber-400/10 text-amber-400"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <p className="mb-4 text-sm font-medium text-zinc-200">
          Debugging pipeline
        </p>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {["Capture", "Analyze", "Trace", "Fix", "Verify"].map(
            (step, index) => (
              <div
                key={step}
                className="rounded-lg border border-zinc-900 bg-zinc-950 p-4"
              >
                <span className="font-mono text-[10px] text-zinc-700">
                  0{index + 1}
                </span>

                <p className="mt-6 text-xs text-zinc-400">{step}</p>
              </div>
            ),
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Analysis({ trace }: { trace: string }) {
  return (
    <InvestigationShell label="Analysis">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400">
        Trace engine running
      </p>

      <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
        Tracing failure...
      </h1>

      <div className="mt-10 space-y-2">
        {[
          "Evidence captured",
          "Stack trace parsed",
          "Source location identified",
          "Source context loaded",
        ].map((step, index) => (
          <div
            key={step}
            className="flex items-center gap-4 rounded-lg border border-zinc-900 bg-zinc-950 px-4 py-4"
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full font-mono text-[10px] ${
                index < 3
                  ? "bg-emerald-400/10 text-emerald-400"
                  : "bg-zinc-900 text-zinc-600"
              }`}
            >
              {index < 3 ? "✓" : "•"}
            </span>

            <span className="text-xs text-zinc-400">{step}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-zinc-900 bg-black p-4">
        <p className="mb-3 font-mono text-[9px] uppercase tracking-wider text-zinc-700">
          Captured evidence
        </p>

        <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-[10px] leading-6 text-zinc-600">
          {trace}
        </pre>
      </div>
    </InvestigationShell>
  );
}

function Diagnosis({
  parsedTrace,
  sourceContext,
  onFix,
  onBack,
}: {
  parsedTrace: ParsedTrace | null;
  sourceContext: SourceContext | null;
  onFix: () => void;
  onBack: () => void;
}) {
  const primaryFrame = parsedTrace?.frames[0];

  return (
    <InvestigationShell label="Diagnosis" onBack={onBack}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[10px] text-zinc-700">
            {primaryFrame?.className?.toUpperCase() ?? "UNKNOWN SOURCE"}
          </p>

          <h1 className="mt-3 text-3xl font-semibold">
            {parsedTrace?.errorType ?? "UnknownError"}
          </h1>

          <p className="mt-2 font-mono text-[10px] text-red-400">
            {primaryFrame
              ? `${primaryFrame.file}:${primaryFrame.line}`
              : "Source location unavailable"}
          </p>

          {primaryFrame && (
            <p className="mt-2 font-mono text-[10px] text-zinc-700">
              method: {primaryFrame.method}()
            </p>
          )}
        </div>

        <span className="w-fit rounded-full bg-emerald-400/10 px-3 py-1.5 font-mono text-[10px] text-emerald-400">
          Source mapped
        </span>
      </div>

      <div className="mt-10 rounded-xl border border-zinc-900 bg-[#030405] overflow-hidden">
        <div className="flex items-center justify-between border-b border-zinc-900 px-4 py-3">
          <span className="font-mono text-[10px] text-zinc-500">
            {sourceContext?.file ?? "Source unavailable"}
          </span>

          {sourceContext && (
            <span className="font-mono text-[9px] text-zinc-700">
              lines {sourceContext.startLine}-{sourceContext.endLine}
            </span>
          )}
        </div>

        {sourceContext ? (
          <div className="overflow-x-auto py-3">
            {sourceContext.lines.map((sourceLine) => (
              <div
                key={sourceLine.number}
                className={`flex min-w-max px-4 py-1 ${
                  sourceLine.isTarget ? "bg-red-400/10" : ""
                }`}
              >
                <span
                  className={`w-10 shrink-0 text-right font-mono text-[10px] ${
                    sourceLine.isTarget
                      ? "text-red-400"
                      : "text-zinc-800"
                  }`}
                >
                  {sourceLine.number}
                </span>

                <span className="mx-4 font-mono text-[10px] text-zinc-800">
                  |
                </span>

                <code
                  className={`font-mono text-[10px] ${
                    sourceLine.isTarget
                      ? "text-red-300"
                      : "text-zinc-500"
                  }`}
                >
                  {sourceLine.code}
                </code>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5 text-xs text-zinc-700">
            No matching source file found.
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-5 lg:col-span-2">
          <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-700">
            Evidence
          </p>

          <p className="mt-4 text-sm leading-7 text-zinc-300">
            The stack trace points to{" "}
            <code className="rounded bg-zinc-900 px-1.5 py-1 font-mono text-xs text-emerald-400">
              {primaryFrame
                ? `${primaryFrame.file}:${primaryFrame.line}`
                : "an unknown location"}
            </code>
            .
          </p>

          <p className="mt-4 text-xs leading-6 text-zinc-600">
            The highlighted source line is the exact location extracted from
            the stack trace.
          </p>
        </div>

        <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-5">
          <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-700">
            Failure path
          </p>

          <div className="mt-5 space-y-4">
            {parsedTrace?.frames.map((frame, index) => (
              <div
                key={`${frame.file}-${frame.line}-${index}`}
                className="flex gap-3"
              >
                <span className="font-mono text-[10px] text-zinc-800">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span
                  className={`font-mono text-[10px] ${
                    index === 0 ? "text-red-400" : "text-zinc-600"
                  }`}
                >
                  {frame.file}:{frame.line}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={onFix}
        className="mt-8 w-full rounded-lg bg-white px-4 py-3 text-xs font-medium text-black hover:bg-zinc-200"
      >
        Continue to fix generation →
      </button>
    </InvestigationShell>
  );
}

function Fix({
  onVerify,
  onBack,
}: {
  onVerify: () => void;
  onBack: () => void;
}) {
  return (
    <InvestigationShell label="Suggested Fix" onBack={onBack}>
      <p className="font-mono text-[10px] text-zinc-700">
        V0.5 SOURCE CONTEXT
      </p>

      <h1 className="mt-3 text-3xl font-semibold">
        Source is now visible.
      </h1>

      <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600">
        TraceLens has connected the stack trace to source code. The next
        milestone is using this context to produce an evidence-backed fix.
      </p>

      <div className="mt-8 rounded-xl border border-zinc-900 bg-zinc-950 p-5">
        <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-700">
          Next engine
        </p>

        <div className="mt-5 space-y-3">
          {[
            "Read source context",
            "Understand failing expression",
            "Generate minimal fix",
            "Verify behavior",
          ].map((step, index) => (
            <div key={step} className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-zinc-800">
                0{index + 1}
              </span>

              <span className="text-xs text-zinc-500">{step}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onVerify}
        className="mt-8 w-full rounded-lg border border-zinc-800 px-4 py-3 text-xs text-zinc-400 hover:bg-zinc-900"
      >
        Continue →
      </button>
    </InvestigationShell>
  );
}

function Verify({
  onSuccess,
  onBack,
}: {
  onSuccess: () => void;
  onBack: () => void;
}) {
  return (
    <InvestigationShell label="Verification" onBack={onBack}>
      <p className="font-mono text-[10px] text-zinc-700">
        PROTOTYPE
      </p>

      <h1 className="mt-3 text-3xl font-semibold">
        Verification engine pending.
      </h1>

      <p className="mt-3 text-sm leading-6 text-zinc-600">
        Real test execution will be added after fix generation.
      </p>

      <button
        onClick={onSuccess}
        className="mt-8 w-full rounded-lg border border-zinc-800 px-4 py-3 text-xs text-zinc-400 hover:bg-zinc-900"
      >
        Finish prototype flow →
      </button>
    </InvestigationShell>
  );
}

function Success({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/10 text-2xl text-emerald-400">
          ✓
        </div>

        <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400">
          Investigation complete
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Failure traced.
          <br />
          Source identified.
        </h1>

        <button
          onClick={onReset}
          className="mt-10 rounded-lg border border-zinc-800 px-5 py-3 text-xs text-zinc-400 hover:bg-zinc-900"
        >
          Back to TraceLens
        </button>
      </div>
    </div>
  );
}

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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:p-5">
      <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-[#0a0c10] p-5 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-wider text-emerald-400">
              New investigation
            </p>

            <h2 className="mt-2 text-lg font-medium">
              Capture an error
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-700 hover:text-zinc-300"
          >
            ✕
          </button>
        </div>

        <textarea
          value={trace}
          onChange={(event) => setTrace(event.target.value)}
          placeholder="Paste stack trace..."
          className="mt-6 h-40 w-full resize-none rounded-lg border border-zinc-900 bg-black p-4 font-mono text-[10px] leading-6 text-zinc-300 outline-none placeholder:text-zinc-800 focus:border-zinc-700"
        />

        <button
          onClick={onAnalyze}
          disabled={!trace.trim()}
          className="mt-3 w-full rounded-lg bg-white px-4 py-3 text-xs font-medium text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Analyze failure →
        </button>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-emerald-400" />

        <span className="text-sm font-medium tracking-wide text-zinc-300">
          TraceLens
        </span>
      </div>

      <div className="rounded-full border border-zinc-900 bg-zinc-950 px-3 py-1.5 font-mono text-[9px] text-zinc-600">
        DEV TOOLS
      </div>
    </header>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-900 bg-zinc-950 p-4">
      <p className="font-mono text-lg text-zinc-200">{value}</p>

      <p className="mt-1 text-[9px] uppercase tracking-wider text-zinc-700">
        {label}
      </p>
    </div>
  );
}

function InvestigationShell({
  label,
  onBack,
  children,
}: {
  label: string;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-5 sm:px-8 sm:py-8">
      <Header />

      <div className="mt-8 flex items-center justify-between border-b border-zinc-900 pb-4">
        {onBack ? (
          <button
            onClick={onBack}
            className="text-xs text-zinc-600 hover:text-zinc-200"
          >
            ← Back
          </button>
        ) : (
          <span />
        )}

        <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-700">
          {label}
        </span>
      </div>

      <section className="py-10 sm:py-14">{children}</section>
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-900 py-6 text-center font-mono text-[9px] text-zinc-800">
      TRACELENS / FAILURE → CAUSE → FIX → VERIFY
    </footer>
  );
}