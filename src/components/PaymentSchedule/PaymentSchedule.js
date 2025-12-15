import React, { useState, useEffect, useRef, useContext } from "react";
import "./print.css";
import httpService from "utility/httpService";
import { formatPaymentSchedule } from "utility/Utility";
import { MainContext } from "context/MainContext";
import { FaPrint } from "react-icons/fa";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

const PaymentSchedule = ({ unitId }) => {
  const { setLoading, notifyError } = useContext(MainContext);
  const componentRef = useRef();
  const [customerSchedule, setCustomerSchedule] = useState(null);
  const [builderSchedule, setBuilderSchedule] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [customerError, setCustomerError] = useState("No data found!");
  const [unit, setUnit] = useState(null);
  const [customerScheduleBreakdown, setCustomerScheduleBreakdown] = useState(
    []
  );
  const [builderScheduleBreakdown, setbuilderScheduleBreakdown] = useState([]);
  const [customer, setCustomer] = useState(null);

  // const fetchPaymentSchedule = async (accountId) => {
  //   try {
  //     setLoading(true);
  //     let paymentRequest = {
  //       id: accountId,
  //       paymentScheduleType: "CUSTOMER",
  //     };
  //     const responsePayment = await httpService.post(
  //       `/paymentSchedule/getByCustomerAccount`,
  //       paymentRequest
  //     );

  //     setSchedule(responsePayment?.data);

  //     const scheduleData = responsePayment?.data;

  //     const obj = [];

  //     var remaining = scheduleData.totalAmount;

  //     if (scheduleData.downPayment > 0) {
  //       remaining -= scheduleData.downPayment;
  //       obj.push({
  //         description: "Down Payment / Booking",
  //         amount: scheduleData.downPayment,
  //         remaining: remaining,
  //       });
  //     }

  //     if (
  //       scheduleData?.paymentPlanType == "INSTALLMENT_RANGE" &&
  //       scheduleData.monthWisePaymentList?.length > 0
  //     ) {
  //       const array = formatPaymentSchedule(scheduleData);

  //       array.map((formattedMonthly) => {
  //         obj.push({
  //           ...formattedMonthly,
  //           remaining: (remaining -= formattedMonthly.amount),
  //         });
  //       });

  //       if (scheduleData.quarterlyPayment > 0) {
  //         const totalAmount = querterlyCount * scheduleData.quarterlyPayment;
  //         remaining -= totalAmount;
  //         const querterlyCount = Math.floor(scheduleData.durationInMonths / 3);

  //         if (querterlyCount > 0)
  //           obj.push({
  //             description: `Quarterly Payment / Booking ( ${scheduleData.quarterlyPayment} x ${querterlyCount} )`,
  //             amount: totalAmount,
  //             remaining: remaining,
  //           });
  //       }

  //       if (scheduleData.halfYearlyPayment > 0) {
  //         const halfYearlyCount = Math.floor(scheduleData.durationInMonths / 6);
  //         const totalAmount = halfYearlyCount * scheduleData.halfYearlyPayment;
  //         remaining -= totalAmount;

  //         if (halfYearlyCount > 0)
  //           obj.push({
  //             description: `Half Yearly Payment / Booking ( ${scheduleData.halfYearlyPayment} x ${halfYearlyCount} )`,
  //             amount: totalAmount,
  //             remaining: remaining,
  //           });
  //       }

  //       if (scheduleData.yearlyPayment > 0) {
  //         const yearlyCount = Math.floor(scheduleData.durationInMonths / 12);
  //         const totalAmount = yearlyCount * scheduleData.yearlyPayment;
  //         remaining -= totalAmount;
  //         if (yearlyCount > 0)
  //           obj.push({
  //             description: `Half Yearly Payment / Booking ( ${scheduleData.yearlyPayment} x ${yearlyCount} )`,
  //             amount: totalAmount,
  //             remaining: remaining,
  //           });
  //       }

  //       if (scheduleData.onPossessionPayment > 0) {
  //         remaining -= scheduleData.onPossessionPayment;
  //         obj.push({
  //           description: "On Possession",
  //           amount: scheduleData.onPossessionPayment,
  //           remaining: remaining,
  //         });
  //       }
  //     } else if (
  //       scheduleData?.paymentPlanType == "INSTALLMENT_SPECIFIC" &&
  //       scheduleData.monthSpecificPaymentList?.length > 0
  //     ) {
  //       scheduleData.monthSpecificPaymentList.map((specific) => {
  //         remaining -= specific.amount;
  //         obj.push({
  //           description: `${specific.month} - ${specific.year} `,
  //           amount: specific.amount,
  //           remaining: remaining,
  //         });
  //       });
  //     }

  //     setScheduleBreakdown(obj);
  //     setLoading(false);
  //   } catch (error) {
  //     console.log("error :: ", error);
  //     setLoading(false);
  //   }
  // };

  const fetchPaymentScheduleByUnit = async (unitId) => {
    try {
      setLoading(true);

      const responsePayment = await httpService.get(
        `/paymentSchedule/getByUnit/${unitId}`
      );

      console.log("responsePayment :: ", responsePayment);

      setCustomerScheduleBreakdown([]);
      setCustomerSchedule(null);
      setbuilderScheduleBreakdown([]);
      setBuilderSchedule(null);

      if (responsePayment?.data?.customer) {
        setCustomerSchedule(responsePayment?.data?.customer);

        const scheduleData = responsePayment?.data?.customer;

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

        if (
          scheduleData?.paymentPlanType == "INSTALLMENT_RANGE" &&
          scheduleData.monthWisePaymentList?.length > 0
        ) {
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
            const querterlyCount = Math.floor(
              scheduleData.durationInMonths / 3
            );

            if (querterlyCount > 0)
              obj.push({
                description: `Quarterly Payment / Booking ( ${scheduleData.quarterlyPayment} x ${querterlyCount} )`,
                amount: totalAmount,
                remaining: remaining,
              });
          }

          if (scheduleData.halfYearlyPayment > 0) {
            const halfYearlyCount = Math.floor(
              scheduleData.durationInMonths / 6
            );
            const totalAmount =
              halfYearlyCount * scheduleData.halfYearlyPayment;
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
        } else if (
          scheduleData?.paymentPlanType == "INSTALLMENT_SPECIFIC" &&
          scheduleData.monthSpecificPaymentList?.length > 0
        ) {
          scheduleData.monthSpecificPaymentList.map((specific) => {
            remaining -= specific.amount;
            obj.push({
              description: `${specific.month} - ${specific.year} `,
              amount: specific.amount,
              remaining: remaining,
            });
          });
        }

        setCustomerScheduleBreakdown(obj);
      } else {
        setCustomerError("This unit is not booked yet.");
      }

      if (responsePayment?.data?.builder) {
        setBuilderSchedule(responsePayment?.data?.builder);

        const scheduleData = responsePayment?.data?.builder;

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

        if (
          scheduleData?.paymentPlanType == "INSTALLMENT_RANGE" &&
          scheduleData.monthWisePaymentList?.length > 0
        ) {
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
            const querterlyCount = Math.floor(
              scheduleData.durationInMonths / 3
            );

            if (querterlyCount > 0)
              obj.push({
                description: `Quarterly Payment / Booking ( ${scheduleData.quarterlyPayment} x ${querterlyCount} )`,
                amount: totalAmount,
                remaining: remaining,
              });
          }

          if (scheduleData.halfYearlyPayment > 0) {
            const halfYearlyCount = Math.floor(
              scheduleData.durationInMonths / 6
            );
            const totalAmount =
              halfYearlyCount * scheduleData.halfYearlyPayment;
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
        } else if (
          scheduleData?.paymentPlanType == "INSTALLMENT_SPECIFIC" &&
          scheduleData.monthSpecificPaymentList?.length > 0
        ) {
          scheduleData.monthSpecificPaymentList.map((specific) => {
            remaining -= specific.amount;
            obj.push({
              description: `${specific.month} - ${specific.year} `,
              amount: specific.amount,
              remaining: remaining,
            });
          });
        }

        setbuilderScheduleBreakdown(obj);
      }

      setCustomer(responsePayment?.data?.customerData);
      setUnit(responsePayment?.data?.unit);
      setLoading(false);
    } catch (error) {
      console.log("error :: ", error);
      setLoading(false);
    }
  };

  const handlePrintPaymentScheduleCustomer = (data) => {
    const printWindow = window.open("", "_blank");
    const organization = JSON.parse(localStorage.getItem("organization")) || {};

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

          .text-center{
             text-align : center;
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

          .schedule-box h4 {
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
            <h1>${organization?.name}</h1>
            <p>${organization?.address}</p>
            <p>Phone: ${organization?.contactNo}</p>
          </div>

          <h2 class="text-center mb-5">
            <strong>Customer Schedule</strong>
          </h2>

          <div class="schedule-details">
            <div class="schedule-box">
              <h4>Payment Schedule Summary</h4>
              <p><strong>Customer:</strong> ${customer?.name || "-"}</p>
              <p><strong>Project:</strong> ${unit?.projectName || "-"}</p>
              <p><strong>Floor:</strong> ${unit?.floorNo || "-"}</p>
              <p><strong>Unit:</strong> ${unit?.unitSerial || "-"}</p>
              <p><strong>Payment Plan Type:</strong> ${data.paymentPlanType}</p>
              <p><strong>Created Date:</strong> ${new Date(
                data.createdDate
              ).toLocaleDateString()}</p>
            </div>

            <div class="schedule-box">
              <h4>💰 Amount Breakdown</h4>
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
                ${customerScheduleBreakdown
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
              <p>Authorized Signature (${organization?.name})</p>
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
  const handlePrintPaymentScheduleBuilder = (data) => {
    const printWindow = window.open("", "_blank");
    const organization = JSON.parse(localStorage.getItem("organization")) || {};
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


           .text-center{
               text-align: center;
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

          .schedule-box h4 {
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
            <h1>${organization?.name}</h1>
            <p>${organization?.address}</p>
            <p>Phone: ${organization?.contactNo}</p>
          </div>

          <h2 class="text-center">
            <strong>Builder Schedule</strong>
          </h2>


          <div class="schedule-details">
            <div class="schedule-box">
              <h4>Payment Schedule Summary</h4>
              <p><strong>Project:</strong> ${unit?.projectName || "-"}</p>
              <p><strong>Floor:</strong> ${unit?.floorNo || "-"}</p>
              <p><strong>Unit:</strong> ${unit?.unitSerial || "-"}</p>
              <p><strong>Payment Plan Type:</strong> ${data.paymentPlanType}</p>
              <p><strong>Created Date:</strong> ${new Date(
                data.createdDate
              ).toLocaleDateString()}</p>
            </div>

            <div class="schedule-box">
              <h4>💰 Amount Breakdown</h4>
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
                ${builderScheduleBreakdown
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
              <p>Authorized Signature (${organization?.name})</p>
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
    if (unitId != 0) {
      fetchPaymentScheduleByUnit(unitId);
      const organization =
        JSON.parse(localStorage.getItem("organization")) || {};

        console.log("organization :: ",organization);
        

      // if (organization)
      //   setOrganization({
      //     name: organization.name,
      //     address: organization.address,
      //     contactNo: organization.contactNo,
      //   });
    }
  }, [unitId]);

  return (
    <>
      <div className="flex flex-wrap">
        <div className=" rounded-12 w-full lg:w-6/12 px-2">
          {customerSchedule ? (
            <>
              <div ref={componentRef} className="schedule-container shadow-lg">
                {/* Header */}
                <div className="schedule-header">
                  <h1>{organization?.name}</h1>
                  <p>{organization?.address}</p>
                  <p>{organization?.contactNo}</p>
                </div>

                {/* Payment Details */}
                <h2 className="text-center mb-5">
                  <strong> Customer Schedule</strong>
                </h2>
                <div className="schedule-details">
                  <div className="schedule-box">
                    <h4>📑 Payment Schedule Summary</h4>
                    <p>
                      <strong>Customer:</strong> {customer?.name}
                    </p>
                    <p>
                      <strong>Project:</strong> {unit?.projectName}
                    </p>
                    <p>
                      <strong>Floor:</strong> {unit?.floorNo}
                    </p>
                    <p>
                      <strong>Unit:</strong> {unit?.unitSerial}
                    </p>
                    <p>
                      <strong>Payment Plan Type:</strong>{" "}
                      {customerSchedule.paymentPlanType}
                    </p>

                    <p>
                      <strong>Created Date:</strong>{" "}
                      {new Date(
                        customerSchedule.createdDate
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="schedule-box">
                    <h4>💰 Amount Breakdown</h4>
                    <p>
                      <strong>Duration (Months):</strong>{" "}
                      {customerSchedule.durationInMonths}
                    </p>
                    <p>
                      <strong>Actual Amount:</strong>{" "}
                      {customerSchedule.actualAmount}
                    </p>
                    <p>
                      <strong>Miscellaneous Charges:</strong>{" "}
                      {customerSchedule.miscellaneousAmount}
                    </p>
                    <p>
                      <strong>Development Charges:</strong>{" "}
                      {customerSchedule.developmentAmount}
                    </p>

                    <p>
                      <strong>Total Amount:</strong>{" "}
                      {customerSchedule.totalAmount}
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
                      {customerScheduleBreakdown.length > 0 ? (
                        <>
                          {customerScheduleBreakdown.map((breakdown, index) => (
                            <tr>
                              <td>{index + 1}</td>
                              <td>{breakdown.description}</td>
                              <td>
                                {parseFloat(breakdown.amount).toLocaleString()}
                              </td>
                              <td>
                                {parseFloat(
                                  breakdown.remaining
                                ).toLocaleString()}
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
                  <ul className="list-disc">
                    <li>
                      Development charges, if any, may be demanded at any time
                      during the schedule.
                    </li>
                    <li>
                      Installments must be paid on or before the 10th of every
                      month.
                    </li>
                    <li>
                      Any changes or revisions in the schedule must be approved
                      in writing by the management.
                    </li>
                  </ul>
                </div>

                {/* Signatures */}
                <div className="schedule-signatures">
                  <div className="signature-box font-normal">
                    <div className="signature-line"></div>
                    <p>Customer Signature</p>
                  </div>
                  <div className="signature-box">
                    <div className="signature-line font-normal"></div>
                    <p>Authorized Signature ({organization})</p>
                  </div>
                </div>
              </div>
              {/* Print Button */}
              <div className="print-btn hide-print">
                <button
                  onClick={() =>
                    handlePrintPaymentScheduleCustomer(customerSchedule)
                  }
                >
                  <FaPrint
                    className="w-5 h-5 inline-block "
                    style={{ paddingBottom: "3px", paddingRight: "5px" }}
                  />{" "}
                  Print schedule
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">{customerError}</div>
          )}
        </div>
        <div className="rounded-12 w-full lg:w-6/12 px-2">
          {builderSchedule ? (
            <>
              <div ref={componentRef} className="schedule-container shadow-lg">
                {/* Header */}
                <div className="schedule-header">
                  <h1>{organization?.name}</h1>
                  <p>{organization?.address}</p>
                  <p>{organization?.contactNo}</p>
                </div>

                {/* Payment Details */}
                <h2 className="text-center mb-5">
                  <strong> Builder Schedule</strong>
                </h2>
                <div className="schedule-details">
                  <div className="schedule-box">
                    <h4>📑 Payment Schedule Summary</h4>

                    <p>
                      <strong>Project:</strong> {unit?.projectName}
                    </p>
                    <p>
                      <strong>Floor:</strong> {unit?.floorNo}
                    </p>
                    <p>
                      <strong>Unit:</strong> {unit?.unitSerial}
                    </p>
                    <p>
                      <strong>Payment Plan Type:</strong>{" "}
                      {builderSchedule.paymentPlanType}
                    </p>

                    <p>
                      <strong>Created Date:</strong>{" "}
                      {new Date(
                        builderSchedule.createdDate
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="schedule-box">
                    <h4>💰 Amount Breakdown</h4>
                    <p>
                      <strong>Duration (Months):</strong>{" "}
                      {builderSchedule.durationInMonths}
                    </p>
                    <p>
                      <strong>Actual Amount:</strong>{" "}
                      {builderSchedule.actualAmount}
                    </p>
                    <p>
                      <strong>Miscellaneous Charges:</strong>{" "}
                      {builderSchedule.miscellaneousAmount}
                    </p>
                    <p>
                      <strong>Development Charges:</strong>{" "}
                      {builderSchedule.developmentAmount}
                    </p>

                    <p>
                      <strong>Total Amount:</strong>{" "}
                      {builderSchedule.totalAmount}
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
                      {builderScheduleBreakdown.length > 0 ? (
                        <>
                          {builderScheduleBreakdown.map((breakdown, index) => (
                            <tr>
                              <td>{index + 1}</td>
                              <td>{breakdown.description}</td>
                              <td>
                                {parseFloat(breakdown.amount).toLocaleString()}
                              </td>
                              <td>
                                {parseFloat(
                                  breakdown.remaining
                                ).toLocaleString()}
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
                  <ul className="list-disc pl-6">
                    <li>
                      Development charges, if any, may be demanded at any time
                      during the schedule.
                    </li>
                    <li>
                      Installments must be paid on or before the 10th of every
                      month.
                    </li>
                    <li>
                      Any changes or revisions in the schedule must be approved
                      in writing by the management.
                    </li>
                  </ul>
                </div>

                {/* Signatures */}
                <div className="schedule-signatures">
                  <div className="signature-box">
                    <div className="signature-line"></div>
                    <p className="font-12">Customer Signature</p>
                  </div>
                  <div className="signature-box">
                    <div className="signature-line"></div>
                    <p className="font-12">
                      Authorized Signature ({organization?.name})
                    </p>
                  </div>
                </div>
              </div>
              {/* Print Button */}
              <div className="print-btn hide-print">
                <button
                  onClick={() =>
                    handlePrintPaymentScheduleBuilder(builderSchedule)
                  }
                >
                  <FaPrint
                    className="w-5 h-5 inline-block "
                    style={{ paddingBottom: "3px", paddingRight: "5px" }}
                  />{" "}
                  Print schedule
                </button>
              </div>
            </>
          ) : (
            <div className="text-center">No data found!</div>
          )}
        </div>
      </div>
    </>
  );
};

export default PaymentSchedule;
