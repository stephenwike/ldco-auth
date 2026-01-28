const parseList = (value?: string): string[] =>
  value
    ? value.split(",").map((v) => v.trim().toLowerCase()).filter(Boolean)
    : [];

const EMAIL_ALLOWLIST = parseList(process.env.ALPHA_EMAIL_ALLOWLIST);
const DOMAIN_ALLOWLIST = parseList(process.env.ALPHA_DOMAIN_ALLOWLIST);

export function isAlphaAllowed(email?: string | null): boolean {
  if (!email) return false;

  const normalized = email.toLowerCase();

  // Safety default: allow all if no env vars are set
  if (EMAIL_ALLOWLIST.length === 0 && DOMAIN_ALLOWLIST.length === 0) {
    return true;
  }

  if (EMAIL_ALLOWLIST.includes(normalized)) return true;

  const domain = normalized.split("@")[1];
  if (domain && DOMAIN_ALLOWLIST.includes(domain)) return true;

  return false;
}
