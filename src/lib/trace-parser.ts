export type StackFrame = {
  className: string;
  method: string;
  file: string;
  line: number;
};

export type ParsedTrace = {
  errorType: string;
  message: string;
  frames: StackFrame[];
};

const FRAME_REGEX =
  /^\s*at\s+([\w.$]+)\.([\w$<>]+)\(([^:()]+):(\d+)\)/;

export function parseTrace(trace: string): ParsedTrace {
  const lines = trace
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const firstLine = lines[0] ?? "";

  const errorMatch = firstLine.match(
    /^([\w.$]+)(?::\s*(.*))?$/
  );

  const errorType =
    errorMatch?.[1]?.split(".").pop() ?? "UnknownError";

  const message = errorMatch?.[2] ?? "";

  const frames: StackFrame[] = [];

  for (const line of lines) {
    const match = line.match(FRAME_REGEX);

    if (!match) continue;

    const [, fullClass, method, file, lineNumber] = match;

    const className =
      fullClass.split(".").pop() ?? fullClass;

    frames.push({
      className,
      method,
      file,
      line: Number(lineNumber),
    });
  }

  return {
    errorType,
    message,
    frames,
  };
}