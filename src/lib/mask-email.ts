export function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!domain) return email;

  const visibleCount = Math.min(2, local.length);
  const visible = local.slice(0, visibleCount);
  const maskedCount = Math.max(local.length - visibleCount, 2);

  return `${visible}${"*".repeat(maskedCount)}@${domain}`;
}
