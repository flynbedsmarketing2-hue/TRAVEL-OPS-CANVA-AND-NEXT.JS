const toTwo = (value: number) => `${value}`.padStart(2, "0");

export const generateProductId = () => {
  const now = new Date();
  const stamp = `${now.getFullYear()}${toTwo(now.getMonth() + 1)}${toTwo(now.getDate())}`;
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PROD-${stamp}-${random}`;
};
