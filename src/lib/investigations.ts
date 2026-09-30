export type InvestigationStatus = "Resolved" | "Open";

export type Investigation = {
  id: string;
  file: string;
  line: number;
  errorType: string;
  status: InvestigationStatus;
  createdAt: string;
};

const STORAGE_KEY = "tracelens-investigations";

export function getInvestigations(): Investigation[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveInvestigation(
  investigation: Investigation,
): Investigation[] {
  const investigations = getInvestigations();

  const updated = [
    investigation,
    ...investigations.filter(
      (item) => item.id !== investigation.id,
    ),
  ].slice(0, 20);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updated),
  );

  return updated;
}

export function createInvestigation(
  file: string,
  line: number,
  errorType: string,
  status: InvestigationStatus = "Resolved",
): Investigation {
  return {
    id: `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`,
    file,
    line,
    errorType,
    status,
    createdAt: new Date().toISOString(),
  };
}