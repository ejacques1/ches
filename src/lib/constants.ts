export const AREAS_OF_RESPONSIBILITY = [
  { id: 1, name: "Assessment of Needs and Capacity" },
  { id: 2, name: "Planning" },
  { id: 3, name: "Implementation" },
  { id: 4, name: "Evaluation and Research" },
  { id: 5, name: "Advocacy" },
  { id: 6, name: "Communication" },
  { id: 7, name: "Leadership and Management" },
  { id: 8, name: "Ethics and Professionalism" },
] as const;

export function getAreaName(areaId: number): string {
  return AREAS_OF_RESPONSIBILITY.find((a) => a.id === areaId)?.name ?? "Unknown";
}

export function getScoreColor(percent: number): string {
  if (percent >= 80) return "text-score-green";
  if (percent >= 50) return "text-score-yellow";
  return "text-score-red";
}

export function getScoreBgColor(percent: number): string {
  if (percent >= 80) return "bg-score-green";
  if (percent >= 50) return "bg-score-yellow";
  return "bg-score-red";
}

export function getScoreLabel(percent: number): string {
  if (percent >= 80) return "Strong";
  if (percent >= 50) return "Moderate";
  return "Needs Work";
}
