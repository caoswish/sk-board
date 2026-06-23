export const INSTITUTIONS = [
  "SKT인재개발원",
  "SK무의연수원",
  "SK아카데미",
  "써닝리더십센터",
  "교원비전센터",
  "청강문화산업대",
] as const;

export type Institution = (typeof INSTITUTIONS)[number];
