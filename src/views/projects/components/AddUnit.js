// import React, { useState } from "react";
// import { useParams } from "react-router-dom/cjs/react-router-dom.min";

// const AddUnit = () => {
//   const { floorId } = useParams();
//   const [unit, setUnit] = useState({
//     serialNo: "",
//     amount: 0,
//     squareFoot: 0,
//     floorId: floorId,
//     unitType: "APARTMENT",
//     paymentPlanType: "ONE-TIME-PAYMENT",
//     roomCount: 0,
//     bathroomCount: 0,
//     paymentSchedule: {
//       durationInMonths: 0,
//       actualAmount: 0,
//       miscellaneousAmount: 0,
//       developmentAmount: 0,
//       totalAmount: 0,
//       downPayment: 0,
//       quarterlyPayment: 0,
//       halfYearlyPayment: 0,
//       yearlyPayment: 0,
//       onPossessionPayment: 0,
//       monthWisePaymentList: [{ fromMonth: 0, toMonth: 0, amount: 0 }],
//     },
//   });

//   const onChangeUnit = (e) => {
//     setUnit({ ...unit, [e.target.name]: e.target.value });
//   };

//   const changePaymentScheduleFields = (e) => {
//     const updatedUnits = { ...unit };
//     const updatedPayment = {
//       ...unit.paymentSchedule,
//       [e.target.name]: e.target.value,
//     };
//     updatedUnits.paymentSchedule = updatedPayment;
//     setUnit(updatedUnits);
//   };

//   const addMonthWisePayment = () => {
//     setUnit((prevUnit) => ({
//       ...prevUnit,
//       paymentSchedule: {
//         ...prevUnit.paymentSchedule,
//         monthWisePaymentList: [
//           ...(prevUnit.paymentSchedule?.monthWisePaymentList || []),
//           { fromMonth: 0, toMonth: 0, amount: 0 },
//         ],
//       },
//     }));
//   };

//   const handleMonthWisePaymentChange = (index, e) => {
//     setUnit((prevUnit) => {
//       const updatedList = [...prevUnit.paymentSchedule.monthWisePaymentList];
//       updatedList[index] = {
//         ...updatedList[index],
//         [e.target.name]: e.target.value,
//       };

//       return {
//         ...prevUnit,
//         paymentSchedule: {
//           ...prevUnit.paymentSchedule,
//           monthWisePaymentList: updatedList,
//         },
//       };
//     });
//   };

//   const removeMonthWisePayment = (monthIndex) => {
//     const confirmed = window.confirm(
//       "Are you sure you want to remove this month-wise payment?"
//     );
//     if (!confirmed) return;

//     setUnit((prevUnit) => {
//       const updatedUnit = { ...prevUnit };
//       updatedUnit.paymentSchedule.monthWisePaymentList.splice(monthIndex, 1);
//       return updatedUnit;
//     });
//   };

//   const handleSubmit = async () => {
//     setLoading(true);
//     try {
//       const response = await httpService.post(`/unit/addOrUpdate`, unit);
//       const data = await response.data;
//       const updatedUnit = [...units, data];

//       notifySuccess(response.responseMessage, 4000);
//       await fetchUnitList();
//       toggleAdd();
//     } catch (err) {
//       notifyError(err.message, err.data, 4000);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleAdd = () => {
//     setBackdrop(!backdrop);
//     setAddModal(!addModal);
//   };

//   return (
//     <div>
//       {addModal ? (
//         <>
//           <div
//             className="inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
//             style={{ position: "fixed", left: "14%", top: "0", width: "75%" }}
//           >
//             <div className="bg-white rounded shadow-lg  w-full max-w-xl">
//               <div className="flex justify-between items-center mb-4 p-4">
//                 <h2 className="text-xl font-bold uppercase">
//                   Update Unit Form
//                 </h2>
//                 <button onClick={toggleAdd}>
//                   <RxCross2 className="w-5 h-5 text-red-500" />
//                 </button>
//               </div>

//               <div className="grid grid-cols-12 gap-4 payback-form">
//                 <div className="flex flex-wrap bg-white">
//                   <div className="w-full lg:w-4/12 px-4">
//                     <div className="relative w-full mb-3">
//                       <label
//                         className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
//                         htmlFor="name"
//                       >
//                         Serial No
//                       </label>
//                       <input
//                         id="name"
//                         type="text"
//                         name="serialNo"
//                         className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
//                         onChange={(e) => onChangeUnit(e)}
//                         value={unit.serialNo}
//                       />
//                     </div>
//                   </div>
//                   <div className="w-full lg:w-4/12 px-4">
//                     <div className="relative w-full mb-3">
//                       <label
//                         className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
//                         htmlFor="name"
//                       >
//                         Square Foot
//                       </label>
//                       <input
//                         id="name"
//                         type="number"
//                         name="squareFoot"
//                         className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
//                         onChange={(e) => onChangeUnit(e)}
//                         value={unit.squareFoot}
//                       />
//                     </div>
//                   </div>
//                   <div className="w-full lg:w-4/12 px-4">
//                     <div className="relative w-full mb-3">
//                       <label
//                         className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
//                         htmlFor="projectType"
//                       >
//                         Unit Type
//                       </label>
//                       <select
//                         id="projectType"
//                         name="unitType"
//                         className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
//                         onChange={(e) => onChangeUnit(e)}
//                         value={unit.unitType}
//                       >
//                         <option value="">SELECT UNIT TYPE</option>
//                         {unitTypes.map((type, index) => (
//                           <option key={index} value={type}>
//                             {type}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>
//                   <div className="w-full lg:w-4/12 px-4">
//                     <div className="relative w-full mb-3">
//                       <label
//                         className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
//                         htmlFor="name"
//                       >
//                         Room Count
//                       </label>
//                       <input
//                         id="name"
//                         type="text"
//                         name="roomCount"
//                         className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
//                         onChange={(e) => onChangeUnit(e)}
//                         value={unit.roomCount}
//                       />
//                     </div>
//                   </div>
//                   <div className="w-full lg:w-4/12 px-4">
//                     <div className="relative w-full mb-3">
//                       <label
//                         className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
//                         htmlFor="name"
//                       >
//                         Bathroom Count
//                       </label>
//                       <input
//                         id="name"
//                         type="text"
//                         name="bathroomCount"
//                         className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
//                         onChange={(e) => onChangeUnit(e)}
//                         value={unit.bathroomCount}
//                       />
//                     </div>
//                   </div>

//                   <div className="w-full lg:w-4/12 px-4">
//                     <div className="relative w-full mb-3">
//                       <label
//                         className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
//                         htmlFor="projectType"
//                       >
//                         Payment Plan Type
//                       </label>
//                       <select
//                         id="projectType"
//                         name="paymentPlanType"
//                         className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
//                         value={unit.paymentPlanType}
//                         onChange={(e) => onChangeUnit(e)}
//                       >
//                         <option value="">SELECT PAYMENT PLAN TYPE</option>
//                         {PAYMENT_PLANS_TYPE.map((type, index) => (
//                           <option key={index} value={type}>
//                             {type}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="px-4">
//                   <div className=" flex flex-wrap">
//                     <div className="w-full px-4 lg:w-6/12 border-right-grey">
//                       {/* Payment Schedule Heading */}
//                       <div className="mt-3 mb-3 text-blueGray-600 text-sm uppercase font-bold">
//                         Payment Schedule
//                       </div>

//                       <div className="px-4 flex flex-wrap">
//                         {/* === First Section: Payment Overview === */}
//                         <div className="w-full flex flex-wrap  border-bottom-grey border-blueGray-200 pb-4 mb-4">
//                           {/* Duration In Months */}
//                           <div className="w-full px-4 lg:w-6/12">
//                             <div className="relative w-full mb-3">
//                               <label
//                                 className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
//                                 htmlFor="durationInMonths"
//                               >
//                                 Duration In Months
//                               </label>
//                               <input
//                                 id="durationInMonths"
//                                 type="number"
//                                 name="durationInMonths"
//                                 className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
//                                 onChange={(e) => changePaymentScheduleFields(e)}
//                                 value={unit.paymentSchedule.durationInMonths}
//                               />
//                             </div>
//                           </div>

//                           {/* Actual Amount */}
//                           <div className="w-full px-4 lg:w-6/12">
//                             <div className="relative w-full mb-3">
//                               <label
//                                 className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
//                                 htmlFor="actualAmount"
//                               >
//                                 Actual Amount
//                               </label>
//                               <input
//                                 id="actualAmount"
//                                 type="number"
//                                 name="actualAmount"
//                                 className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
//                                 onChange={(e) => changePaymentScheduleFields(e)}
//                                 value={unit.paymentSchedule.actualAmount}
//                               />
//                             </div>
//                           </div>

//                           {/* Miscellaneous Amount */}
//                           <div className="w-full px-4 lg:w-6/12">
//                             <div className="relative w-full mb-3">
//                               <label
//                                 className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
//                                 htmlFor="miscellaneousAmount"
//                               >
//                                 Miscellaneous Amount
//                               </label>
//                               <input
//                                 id="miscellaneousAmount"
//                                 type="number"
//                                 name="miscellaneousAmount"
//                                 className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
//                                 onChange={(e) => changePaymentScheduleFields(e)}
//                                 value={unit.paymentSchedule.miscellaneousAmount}
//                               />
//                             </div>
//                           </div>

//                           {/* developmentAmount Amount */}
//                           <div className="w-full px-4 lg:w-6/12">
//                             <div className="relative w-full mb-3">
//                               <label
//                                 className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
//                                 htmlFor="developmentAmount"
//                               >
//                                 Development Amount
//                               </label>
//                               <input
//                                 id="developmentAmount"
//                                 type="number"
//                                 name="developmentAmount"
//                                 className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
//                                 onChange={(e) => changePaymentScheduleFields(e)}
//                                 value={unit.paymentSchedule.developmentAmount}
//                               />
//                             </div>
//                           </div>

//                           {/* Total Amount */}
//                           <div className="w-full px-4 lg:w-6/12">
//                             <div className="relative w-full mb-3">
//                               <label
//                                 className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
//                                 htmlFor="totalAmount"
//                               >
//                                 Total Amount
//                               </label>
//                               <input
//                                 id="totalAmount"
//                                 type="text"
//                                 name="totalAmount"
//                                 disabled
//                                 className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-400 bg-gray-100 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
//                                 value={
//                                   Number(unit.paymentSchedule.actualAmount) +
//                                   Number(
//                                     unit.paymentSchedule.miscellaneousAmount
//                                   ) +
//                                   Number(unit.paymentSchedule.developmentAmount)
//                                 }
//                               />
//                             </div>
//                           </div>
//                         </div>

//                         {unit.paymentPlanType == "INSTALLMENT" ? (
//                           <>
//                             {/* Down Payment */}
//                             <div className="w-full px-4 lg:w-6/12">
//                               <div className="relative w-full mb-3">
//                                 <label
//                                   className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
//                                   htmlFor="downPayment"
//                                 >
//                                   Down Payment
//                                 </label>
//                                 <input
//                                   id="downPayment"
//                                   type="text"
//                                   name="downPayment"
//                                   className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
//                                   onChange={(e) =>
//                                     changePaymentScheduleFields(e)
//                                   }
//                                   value={unit.paymentSchedule.downPayment}
//                                 />
//                               </div>
//                             </div>

//                             {/* Quarterly Payment */}
//                             <div className="w-full px-4 lg:w-6/12">
//                               <div className="relative w-full mb-3">
//                                 <label
//                                   className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
//                                   htmlFor="quarterlyPayment"
//                                 >
//                                   Quarterly Payment
//                                 </label>
//                                 <input
//                                   id="quarterlyPayment"
//                                   type="text"
//                                   name="quarterlyPayment"
//                                   className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
//                                   onChange={(e) =>
//                                     changePaymentScheduleFields(e)
//                                   }
//                                   value={unit.paymentSchedule.quarterlyPayment}
//                                 />
//                               </div>
//                             </div>

//                             {/* Half-Yearly Payment */}
//                             <div className="w-full px-4 lg:w-6/12">
//                               <div className="relative w-full mb-3">
//                                 <label
//                                   className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
//                                   htmlFor="halfYearlyPayment"
//                                 >
//                                   Half-Yearly Payment
//                                 </label>
//                                 <input
//                                   id="halfYearlyPayment"
//                                   type="text"
//                                   name="halfYearlyPayment"
//                                   className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
//                                   onChange={(e) =>
//                                     changePaymentScheduleFields(e)
//                                   }
//                                   value={unit.paymentSchedule.halfYearlyPayment}
//                                 />
//                               </div>
//                             </div>

//                             <div className="w-full px-4 lg:w-6/12">
//                               <div className="relative w-full mb-3">
//                                 <label
//                                   className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
//                                   htmlFor="yearlyPayment"
//                                 >
//                                   Yearly Payment
//                                 </label>
//                                 <input
//                                   id="yearlyPayment"
//                                   type="text"
//                                   name="yearlyPayment"
//                                   className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
//                                   onChange={(e) =>
//                                     changePaymentScheduleFields(e)
//                                   }
//                                   value={unit.paymentSchedule.yearlyPayment}
//                                 />
//                               </div>
//                             </div>

//                             <div className="w-full px-4 lg:w-6/12">
//                               <div className="relative w-full mb-3">
//                                 <label
//                                   className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
//                                   htmlFor="onPossessionPayment"
//                                 >
//                                   On Possession Payment
//                                 </label>
//                                 <input
//                                   id="onPossessionPayment"
//                                   type="text"
//                                   name="onPossessionPayment"
//                                   className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
//                                   onChange={(e) =>
//                                     changePaymentScheduleFields(e)
//                                   }
//                                   value={
//                                     unit.paymentSchedule.onPossessionPayment
//                                   }
//                                 />
//                               </div>
//                             </div>
//                           </>
//                         ) : (
//                           <></>
//                         )}
//                       </div>
//                     </div>

//                     {unit.paymentPlanType == "INSTALLMENT" ? (
//                       <div className="w-full lg:w-6/12 ">
//                         <div className="relative w-full">
//                           <div>
//                             <div className="px-4 mt-3 mb-3  rounded">
//                               <div className="flex justify-between">
//                                 <div className="uppercase text-blueGray-600 font-bold text-sm text-center">
//                                   Month Wise Payment
//                                 </div>
//                                 <button
//                                   type="button"
//                                   onClick={() => addMonthWisePayment()}
//                                   className="bg-red-500 text-white  font-bold uppercase text-xs px-3 py-1 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
//                                 >
//                                   <IoMdAddCircle
//                                     className="inline-block w-3 h-3"
//                                     style={{ paddingRight: "0px" }}
//                                   />{" "}
//                                   Row
//                                 </button>
//                               </div>

//                               {unit?.paymentSchedule?.monthWisePaymentList?.map(
//                                 (monthly, mIndex) => (
//                                   <div className="mt-6 flex flex-wrap">
//                                     <div className="mt-6 text-left pt-4">
//                                       {mIndex + 1} -
//                                     </div>
//                                     <div className="w-full lg:w-3/12 ">
//                                       <div className="relative w-full mb-3">
//                                         <label
//                                           className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
//                                           htmlFor="name"
//                                         >
//                                           From Month
//                                         </label>
//                                         <input
//                                           id="name"
//                                           type="text"
//                                           name="fromMonth"
//                                           className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
//                                           onChange={(e) =>
//                                             handleMonthWisePaymentChange(
//                                               mIndex,
//                                               e
//                                             )
//                                           }
//                                           value={
//                                             unit.paymentSchedule
//                                               .monthWisePaymentList[mIndex]
//                                               .fromMonth
//                                           }
//                                         />
//                                       </div>
//                                     </div>
//                                     <div className="w-full lg:w-3/12 px-2">
//                                       <div className="relative w-full mb-3">
//                                         <label
//                                           className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
//                                           htmlFor="name"
//                                         >
//                                           To Month
//                                         </label>
//                                         <input
//                                           id="name"
//                                           type="text"
//                                           name="toMonth"
//                                           className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
//                                           onChange={(e) =>
//                                             handleMonthWisePaymentChange(
//                                               mIndex,
//                                               e
//                                             )
//                                           }
//                                           value={
//                                             unit.paymentSchedule
//                                               .monthWisePaymentList[mIndex]
//                                               .toMonth
//                                           }
//                                         />
//                                       </div>
//                                     </div>
//                                     <div className="w-full lg:w-4/12">
//                                       <div className="relative w-full mb-3">
//                                         <label
//                                           className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
//                                           htmlFor="name"
//                                         >
//                                           Amount
//                                         </label>
//                                         <input
//                                           id="name"
//                                           type="text"
//                                           name="amount"
//                                           className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
//                                           onChange={(e) =>
//                                             handleMonthWisePaymentChange(
//                                               mIndex,
//                                               e
//                                             )
//                                           }
//                                           value={
//                                             unit.paymentSchedule
//                                               .monthWisePaymentList[mIndex]
//                                               .amount
//                                           }
//                                         />
//                                       </div>
//                                     </div>
//                                     <div className=" pl-7 mt-6 text-right pt-1">
//                                       <button
//                                         type="button"
//                                         onClick={() =>
//                                           removeMonthWisePayment(mIndex)
//                                         }
//                                         className=" text-red-500   outline-none focus:outline-none ease-linear transition-all duration-150"
//                                       >
//                                         <MdDeleteForever
//                                           style={{
//                                             fontSize: "25px",
//                                             marginTop: "9px",
//                                           }}
//                                         />
//                                       </button>
//                                     </div>
//                                     <hr className="mt-6 border-b-1 border-blueGray-300" />
//                                   </div>
//                                 )
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     ) : (
//                       ""
//                     )}
//                   </div>
//                 </div>

//                 <div className="w-full lg:w-4/12 px-4 mb-3">
//                   <button
//                     type="submit"
//                     onClick={handleSubmit}
//                     className="mt-7 ml-4 bg-emerald-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
//                   >
//                     <HiMiniBuildingStorefront
//                       className="w-5 h-5 inline-block "
//                       style={{ paddingBottom: "3px", paddingRight: "5px" }}
//                     />
//                     ADD UNIT
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </>
//       ) : (
//         <></>
//       )}
//     </div>
//   );
// };

// export default AddUnit;
