export const projectTypes = ["APARTMENT", "SHOP", "PLOT"];
export const unitTypes = ["APARTMENT", "SHOP"];
export const paymentTypes = ["CASH", "ONLINE", "PAY_ORDER", "CUSTOM"];

export const getOrdinal = (num) => {
  if (num == 0) return "Ground";
  const ones = num % 10;
  const tens = Math.floor(num / 10) % 10;

  if (tens === 1) {
    return `${num}th`; // Handles the 11th, 12th, 13th cases
  }

  switch (ones) {
    case 1:
      return `${num}st`;
    case 2:
      return `${num}nd`;
    case 3:
      return `${num}rd`;
    default:
      return `${num}th`;
  }
};
