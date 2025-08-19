export const projectTypes = ["APARTMENT", "SHOP", "PLOT"];
export const unitTypes = ["APARTMENT", "SHOP"];
export const PAYMENT_PLANS_TYPE = ["INSTALLMENT", "ONE_TIME_PAYMENT"];
export const paymentTypes = ["CASH", "ONLINE", "PAY_ORDER", "CUSTOM"];
export const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

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

export const TENURE_LIST = [
  {
    title: "Last 7 days",
    value: 7
  },
  {
    title: "Last 10 days",
    value: 10
  },
  {
    title: "Last 30 days",
    value: 30
  },
  {
    title: "Last 90 days",
    value: 90
  },
  {
    title: "Last 365 days",
    value: 365
  }
]


export function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export function getFormattedDateNDaysAgo(daysBefore) {
  const date = new Date();
  date.setDate(date.getDate() - daysBefore);
  return formatDate(date);
}


export const TRANSACTION_TYPES = ["CREDIT" , "DEBIT" , "DEBIT_CREDIT"]