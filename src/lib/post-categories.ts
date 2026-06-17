export const POST_CATEGORIES = [
  "과정 내용",
  "이동/숙소",
  "회장과의 대화",
  "기타",
] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number];
