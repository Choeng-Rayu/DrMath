export function plain(value: string) {
  return value.replace(/<[^>]*>/g, "");
}
