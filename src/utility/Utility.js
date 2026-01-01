export const projectTypes = ["APARTMENT", "SHOP", "PLOT"];
export const CANCEL_BOOKING_FEES_TYPE = ["FIXED", "PERCENTILE"];
export const unitTypes = ["APARTMENT", "SHOP"];
export const paymentReasons = [
  "INSTALLMENT",
  "BOOKING",
  "DEVELOPMENT",
  "ADJUSTMENT",
];
export const CHEQUE = "CHEQUE";
export const CASH = "CASH";
export const PAY_ORDER = "PAY_ORDER";
export const CUSTOM = "CUSTOM";
export const PAYMENT_PLANS_TYPE = [
  "ONE_TIME_PAYMENT",
  "INSTALLMENT_RANGE",
  "INSTALLMENT_SPECIFIC",
];
export const paymentTypes = ["CASH", "ONLINE", "PAY_ORDER", "CHEQUE", "CUSTOM"];
export const EXPENSE_TYPE = ["CONSTRUCTION", "MISCELLANEOUS"];
export const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const generateYears = (past, future) => {
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - past;
  const endYear = currentYear + future;

  const years = [];
  for (let year = startYear; year <= endYear; year++) {
    years.push(year);
  }
  return years;
};

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
    value: 7,
  },
  {
    title: "Last 10 days",
    value: 10,
  },
  {
    title: "Last 30 days",
    value: 30,
  },
  {
    title: "Last 90 days",
    value: 90,
  },
  {
    title: "Last 365 days",
    value: 365,
  },
];

export function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-based
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export function getFormattedDateNDaysAgo(daysBefore) {
  const date = new Date();
  date.setDate(date.getDate() - daysBefore);
  return formatDate(date);
}

export function generateBookingHtml(data) {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Booking Application Form</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
      .form-container { border: 3px solid #f7941d; padding: 20px; max-width: 900px; margin: 20px auto; }
      .top-bar { text-align: center; margin-bottom: 10px; }
      .top-bar h2 { margin: 0; color: #f7941d; font-size: 22px; }
      .subtitle { margin: 0; font-weight: bold; }
      .sub-heading { text-align: center; font-size: 18px; font-weight: bold; color: #d12a2a; }
      .info { width: 100%; border-collapse: collapse; margin-top: 30px; }
      .unit-info-table { min-width: 100%; }
      .info td { border: 1px solid #ccc; padding: 6px 8px; vertical-align: top; }
      .declaration { margin-top: 30px; font-size: 14px; line-height: 1.5; font-style: italic; }
      .footer { margin-top: 30px; display: flex; justify-content: space-between; font-size: 14px; }
      .signature { text-align: right; }
      .photo-box { border: 2px solid black; width: 120px; height: 140px; display: flex; align-items: center; justify-content: center; font-size: 14px; background: #f0f0f0; }
      .photo-td { max-width: 51px; }
      .mx { margin-right: 10px; }
      .mx-20 { margin-right: 20px; }
      .underline { text-decoration: underline; }
      .container { display: flex; width: 100%; align-items: flex-start; justify-content: space-between; }
      .left { flex: 0 0 80%; padding-top: 75px; }
      .right { display: flex; justify-content: center; }
      .row { display: flex; margin-bottom: 15px; }
      .field { flex: 1; padding-right: 15px; }
      .label { font-weight: bold; }
      .value { display: inline-block; border-bottom: 1px solid black; min-width: 50%; padding: 0 5px; text-align: center; }
    </style>
  </head>
  <body>
    <div class="form-container">
      <div class="top-bar">
        <h2>${data.orgName}</h2>
        <p class="subtitle">${data.projectName}</p>
        <div class="sub-heading">APPLICATION FORM</div>
      </div>

      <div class="container">
        <!-- First row -->
        <div class="left">
          <div class="row">
            <div class="field">
              <span class="label">Booking No:</span>
              <span class="value">${data.bookingNo}</span>
            </div>
            <div class="field">
              <span class="label">Customer No:</span>
              <span class="value">${data.customerNo}</span>
            </div>
          </div>

          <!-- Second row -->
          <div class="row">
            <div class="field">
              <span class="label">Serial:</span>
              <span class="value">${data.serial}</span>
            </div>
            <div class="field">
              <span class="label">Type:</span>
              <span class="value">${data.type}</span>
            </div>
            <div class="field">
              <span class="label">Floor:</span>
              <span class="value">${data.floor}</span>
            </div>
            <div class="field">
              <span class="label">Size:</span>
              <span class="value">${data.size}</span>
            </div>
          </div>
        </div>
        <div class="right">
          <div class="photo-box">Photo</div>
        </div>
      </div>

      <table class="info">
        <tbody>
          <tr><td><b>Name:</b></td><td>${data.name}</td></tr>
          <tr><td><b>Father’s/Husband’s Name:</b></td><td>${
            data.guardianName
          }</td></tr>
          <tr><td><b>Postal Address:</b></td><td>${data.postalAddress}</td></tr>
          <tr><td><b>Residential Address:</b></td><td>${
            data.residentialAddress
          }</td></tr>
          <tr><td><b>Phone (Office):</b></td><td>${data.phone}</td></tr>
          <tr><td><b>Email Address:</b></td><td>${data.email}</td></tr>
          <tr><td><b>Age:</b></td><td>${data.age}</td></tr>
          <tr><td><b>Nationality:</b></td><td>${data.nationality}</td></tr>
          <tr><td><b>CNIC:</b></td><td>${data.cnic}</td></tr>
          <tr><td><b>Nominee:</b></td><td>${data.nominee} (${
    data.nomineeRelation
  })</td></tr>
        </tbody>
      </table>

      <div class="declaration">
        <p>1. I hereby declare that I have read and understand the terms and conditions of the allotment of the apartment and accept the same.</p>
        <p>2. I further agree to pay regularly installments and dues and abide by all rules and regulations prescribed by Vision Builders & Marketing from time to time.</p>
        <p>3. I enclose herewith a sum of Rs. ${
          data.amount
        }/- by Bank Draft / Pay Order No. ${
    data.payOrderNo || "________"
  } drawn on ${
    data.bank || "________"
  } on account of booking of the above unit.</p>
      </div>

      <div class="footer">
        <div><b>Date:</b> <span class="underline">${data.date}</span> </div>
        <div class="signature">
          <p>_________________________</p>
          <p class="mx-20">Applicant’s Signature</p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `;
}

export const TRANSACTION_TYPES = ["CREDIT", "DEBIT", "DEBIT_CREDIT"];

export function formatPaymentSchedule(scheduleData) {
  if (!scheduleData?.monthWisePaymentList?.length) return [];

  return [...scheduleData.monthWisePaymentList]
    .sort((a, b) => a.fromMonth - b.fromMonth) // ✅ sort by starting month
    .map((data) => {
      const totalMonths = data.toMonth - data.fromMonth + 1;
      const totalAmount = totalMonths * data.amount;

      return {
        description: `Monthly Installment For ${data.fromMonth} - ${data.toMonth} Month x ${data.amount}`,
        amount: totalAmount,
      };
    });
}
