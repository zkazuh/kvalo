export function nickGen() {
  const prefix = "Anon#";
  const hash = Math.random().toString(36).slice(2).padEnd(6, '0').substring(0, 6);
  return `${prefix}${hash}`;
}
