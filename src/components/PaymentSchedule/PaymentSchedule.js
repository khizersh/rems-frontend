import React, { useState, useEffect, useRef } from "react";
import "./print.css";
import httpService from "utility/httpService";
import { formatPaymentSchedule } from "utility/Utility";

const PaymentSchedule = ({ accountId }) => {
  const componentRef = useRef();
  const [schedule, setSchedule] = useState(null);
  const [scheduleBreakdown, setScheduleBreakdown] = useState([]);
  const [customer, setCustomer] = useState(null);

  const fetchPaymentSchedule = async (accountId) => {
    try {
      let paymentRequest = {
        id: accountId,
        paymentScheduleType: "CUSTOMER",
      };
      const responsePayment = await httpService.post(
        `/paymentSchedule/getByCustomerAccount`,
        paymentRequest
      );

      setSchedule(responsePayment?.data);

      const scheduleData = responsePayment?.data;

      const obj = [];

      var remaining = scheduleData.totalAmount;

      if (scheduleData.downPayment > 0) {
        remaining -= scheduleData.downPayment;
        obj.push({
          description: "Down Payment / Booking",
          amount: scheduleData.downPayment,
          remaining: remaining,
        });
      }

      if (scheduleData.monthWisePaymentList?.length > 0) {
        const array = formatPaymentSchedule(scheduleData);

        array.map((formattedMonthly) => {
          obj.push({
            ...formattedMonthly,
            remaining: (remaining -= formattedMonthly.amount),
          });
        });

        if (scheduleData.quarterlyPayment > 0) {
          const totalAmount = querterlyCount * scheduleData.quarterlyPayment;
          remaining -= totalAmount;
          const querterlyCount = Math.floor(scheduleData.durationInMonths / 3);

          if (querterlyCount > 0)
            obj.push({
              description: `Quarterly Payment / Booking ( ${scheduleData.quarterlyPayment} x ${querterlyCount} )`,
              amount: totalAmount,
              remaining: remaining,
            });
        }

        if (scheduleData.halfYearlyPayment > 0) {
          const halfYearlyCount = Math.floor(scheduleData.durationInMonths / 6);
          const totalAmount = halfYearlyCount * scheduleData.halfYearlyPayment;
          remaining -= totalAmount;

          if (halfYearlyCount > 0)
            obj.push({
              description: `Half Yearly Payment / Booking ( ${scheduleData.halfYearlyPayment} x ${halfYearlyCount} )`,
              amount: totalAmount,
              remaining: remaining,
            });
        }

        if (scheduleData.yearlyPayment > 0) {
          const yearlyCount = Math.floor(scheduleData.durationInMonths / 12);
          const totalAmount = yearlyCount * scheduleData.yearlyPayment;
          remaining -= totalAmount;
          if (yearlyCount > 0)
            obj.push({
              description: `Half Yearly Payment / Booking ( ${scheduleData.yearlyPayment} x ${yearlyCount} )`,
              amount: totalAmount,
              remaining: remaining,
            });
        }

        if (scheduleData.onPossessionPayment > 0) {
          remaining -= scheduleData.onPossessionPayment;
          obj.push({
            description: "On Possession",
            amount: scheduleData.onPossessionPayment,
            remaining: remaining,
          });
        }

        if (scheduleData.developmentAmount > 0) {
          remaining -= scheduleData.developmentAmount;
          obj.push({
            description: "Development Charges",
            amount: scheduleData.developmentAmount,
            remaining: remaining,
          });
        }
      }

      console.log("final array :: ", obj);

      setScheduleBreakdown(obj);
    } catch (error) {
      console.log("error :: ", error);
    }
  };

  const fetchCustomerDetail = async (accountId) => {
    try {
      const data = await httpService.get(
        `/customer/getByAccountId/${accountId}`
      );
      setCustomer(data?.data?.customer);
    } catch (error) {}
  };

  const handlePrintPaymentSchedule = (data) => {
    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
    <html>
      <head>
        <title>Customer Payment Schedule</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #333;
            background: #fff;
          }

          .schedule-container {
            max-width: 900px;
            margin: 0 auto;
          }

          .schedule-header {
            text-align: center;
            margin-bottom: 20px;
          }

          .schedule-header h1 {
            margin: 0;
            font-size: 28px;
          }

          .schedule-header p {
            font-size: 14px;
            color: #666;
          }

          .schedule-details {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 30px;
          }

          .schedule-box {
            flex: 1;
            border: 1px solid #ccc;
            padding: 15px;
            border-radius: 6px;
            background: #f9f9f9;
          }

          .schedule-box h2 {
            font-size: 18px;
            margin-bottom: 10px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
          }

          .schedule-box p {
            margin: 5px 0;
            font-size: 15px;
          }

          .schedule-table-section h2 {
            font-size: 20px;
            margin-top: 20px;
            margin-bottom: 10px;
            text-align: left;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }

          table th, table td {
            border: 1px solid #ccc;
            padding: 10px;
            text-align: center;
            font-size: 14px;
          }

          table th {
            background: #f5f5f5;
          }

          .schedule-terms h2 {
            font-size: 18px;
            margin-bottom: 10px;
          }

          .schedule-terms ul {
            margin-left: 20px;
          }

          .schedule-terms li {
            font-size: 14px;
            margin-bottom: 6px;
          }

          .schedule-signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 50px;
          }

          .signature-box {
            width: 45%;
            text-align: center;
          }

          .signature-line {
            border-top: 1px solid #000;
            margin-top: 50px;
            padding-top: 5px;
          }

          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            .schedule-container {
              border: none;
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="schedule-container">
          <div class="schedule-header">
            <h1>Vision Builder and Developer</h1>
            <p>SHOP # 4, B-81 Mustafabad, Malir City, Karachi </p>
            <p>Phone: 0336-2590911, 03132107640, 0313-2510343, 0347-2494998</p>
          </div>

          <div class="schedule-details">
            <div class="schedule-box">
              <h2>📑 Payment Schedule Summary</h2>
              <p><strong>Customer:</strong> ${customer?.customerName || "-"}</p>
              <p><strong>Project:</strong> ${customer?.projectName || "-"}</p>
              <p><strong>Floor:</strong> ${customer?.floorNo || "-"}</p>
              <p><strong>Unit:</strong> ${customer?.unitSerial || "-"}</p>
              <p><strong>Payment Plan Type:</strong> ${data.paymentPlanType}</p>
              <p><strong>Created Date:</strong> ${new Date(
                data.createdDate
              ).toLocaleDateString()}</p>
            </div>

            <div class="schedule-box">
              <h2>💰 Amount Breakdown</h2>
              <p><strong>Duration (Months):</strong> ${
                data.durationInMonths
              }</p>
              <p><strong>Actual Amount:</strong> ${data.actualAmount}</p>
              <p><strong>Miscellaneous Charges:</strong> ${
                data.miscellaneousAmount
              }</p>
              <p><strong>Development Charges:</strong> ${
                data.developmentAmount
              }</p>
              <p><strong>Total Amount:</strong> ${data.totalAmount}</p>
            </div>
          </div>

          <div class="schedule-table-section">
            <h2>📆 Payment Schedule Breakdown</h2>
            <table>
              <thead>
                <tr>
                  <th>S No.</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Balance Amount</th>
                </tr>
              </thead>
              <tbody>
                ${scheduleBreakdown
                  .map(
                    (item, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${item.description}</td>
                    <td>${parseFloat(item.amount).toLocaleString()}</td>
                    <td>${parseFloat(item.remaining).toLocaleString()}</td>
                  </tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          </div>

          <div class="schedule-terms">
            <h2>📜 Important Notes & Terms</h2>
            <ul>
              <li>Development charges, if any, may be demanded at any time during the schedule.</li>
              <li>Installments must be paid on or before the 10th of every month.</li>
              <li>Any changes or revisions in the schedule must be approved in writing by the management.</li>
            </ul>
          </div>

          <div class="schedule-signatures">
            <div class="signature-box">
              <div class="signature-line"></div>
              <p>Customer Signature</p>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <p>Authorized Signature (Vision Builder)</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  useEffect(() => {
    if (accountId != 0) {
      fetchPaymentSchedule(accountId);
      fetchCustomerDetail(accountId);
    }
  }, [accountId]);

  return (
    <>
      {schedule && customer ? (
        <>
          <div ref={componentRef} className="schedule-container">
            {/* Header */}
            <div className="schedule-header">
              <h1>Vision Builder and Developer</h1>
              <p>SHOP # 4, B-81 Mustafabad, Malir City, Karachi </p>
              <p>
                Phone: 0336-2590911, 03132107640, 0313-2510343, 0347-2494998
              </p>
            </div>

            {/* Payment Details */}
            <div className="schedule-details">
              <div className="schedule-box">
                <h2>📑 Payment Schedule Summary</h2>
                <p>
                  <strong>Customer:</strong> {customer.customerName}
                </p>
                <p>
                  <strong>Project:</strong> {customer.projectName}
                </p>
                <p>
                  <strong>Floor:</strong> {customer.floorNo}
                </p>
                <p>
                  <strong>Unit:</strong> {customer.unitSerial}
                </p>
                <p>
                  <strong>Payment Plan Type:</strong> {schedule.paymentPlanType}
                </p>

                <p>
                  <strong>Created Date:</strong>{" "}
                  {new Date(schedule.createdDate).toLocaleDateString()}
                </p>
              </div>

              <div className="schedule-box">
                <h2>💰 Amount Breakdown</h2>
                <p>
                  <strong>Duration (Months):</strong>{" "}
                  {schedule.durationInMonths}
                </p>
                <p>
                  <strong>Actual Amount:</strong> {schedule.actualAmount}
                </p>
                <p>
                  <strong>Miscellaneous Charges:</strong>{" "}
                  {schedule.miscellaneousAmount}
                </p>
                <p>
                  <strong>Development Charges:</strong>{" "}
                  {schedule.developmentAmount}
                </p>

                <p>
                  <strong>Total Amount:</strong> {schedule.totalAmount}
                </p>
              </div>
            </div>

            {/* Month-wise Table */}
            <div className="schedule-table-section">
              <h2>📆 Payment Schedule Breakdown</h2>
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>S No.</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Balance Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduleBreakdown.length > 0 ? (
                    <>
                      {scheduleBreakdown.map((breakdown, index) => (
                        <tr>
                          <td>{index + 1}</td>
                          <td>{breakdown.description}</td>
                          <td>
                            {parseFloat(breakdown.amount).toLocaleString()}
                          </td>
                          <td>
                            {parseFloat(breakdown.remaining).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </>
                  ) : (
                    <></>
                  )}
                </tbody>
              </table>
            </div>

            {/* Terms & Conditions */}
            <div className="schedule-terms">
              <h2>📜 Important Notes & Terms</h2>
              <ul>
                <li>Point one</li>
                <li>Point two</li>
                <li>Point three</li>
                <li>Point four</li>
                <li>Point five</li>
              </ul>
            </div>

            {/* Signatures */}
            <div className="schedule-signatures">
              <div className="signature-box">
                <div className="signature-line"></div>
                <p>Customer Signature</p>
              </div>
              <div className="signature-box">
                <div className="signature-line"></div>
                <p>Authorized Signature (Vision Builder)</p>
              </div>
            </div>
          </div>
          {/* Print Button */}
          <div className="print-btn hide-print">
            <button onClick={() => handlePrintPaymentSchedule(schedule)}>
              Print schedule
            </button>
          </div>
        </>
      ) : (
        <div className="text-center">No data found!</div>
      )}
    </>
  );
};

export default PaymentSchedule;
