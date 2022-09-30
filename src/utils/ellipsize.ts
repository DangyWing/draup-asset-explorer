export function middleEllipsize(str: string) {
  if (str) {
    if (str.length > 41) {
      return str.substr(0, 5) + "..." + str.substr(str.length - 5, str.length);
    }
  }
  return str;
}
