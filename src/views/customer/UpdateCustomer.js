import React, { useContext, useEffect, useState } from "react";
import { MainContext } from "context/MainContext";
import httpService from "../../utility/httpService.js";
import { FaUserPlus } from "react-icons/fa";
import { useParams } from "react-router-dom/cjs/react-router-dom.min.js";

export default function AddCustomer() {
  const { loading, setLoading, notifyError, notifySuccess } =
    useContext(MainContext);
  const { customerId } = useParams();
  const [customer, setCustomer] = useState({
    name: "",
    country: "",
    city: "",
    address: "",
    contactNo: "",
    nationalId: "",
    nextOFKinName: "",
    guardianName: "",
    nextOFKinNationalId: "",
    relationShipWithKin: "",
    organizationId: 1, // default org id
    projectId: 0,
    floorId: 0,
    unitId: 0,
    createdBy: "", // assuming static for now
    updatedBy: "",
    email: "",
    username: "",
    createdDate: "",
    updatedDate: null,
  });

  const resetState = () => {
    setCustomer({
      name: "",
      country: "",
      contactNo: "",
      city: "",
      address: "",
      nationalId: "",
      nextOFKinName: "",
      guardianName: "",
      nextOFKinNationalId: "",
      relationShipWithKin: "",
      organizationId: 1,
      projectId: 0,
      floorId: 0,
      unitId: 0,
      createdBy: "",
      updatedBy: "",
      email: "",
      username: "",
      password: "",
      updatedDate: null,
    });
  };

  const fetchCustomerDetail = async () => {
    try {
      const response = await httpService.get(`/customer/${customerId}`);
      console.log("response :: ", response);

      setCustomer(response.data || {});
    } catch (err) {
      notifyError("Failed to load projects", 4000);
    }
  };

  const changeCustomerFields = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const updateCustomer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await httpService.post(
        `/customer/updateCustomer`,
        customer
      );
      notifySuccess(
        response.responseMessage || "Customer added successfully!",
        4000
      );
      resetState();
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerDetail();
  }, []);

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg border-0">
      <div className="rounded-t bg-white mb-0 px-6 py-6">
        <div className="flex justify-between">
          <h6 className="text-blueGray-700 text-xl font-bold uppercase">
            Update Customer
          </h6>
        </div>
      </div>
      <div className="bg-white flex flex-wrap  py-3 mb-5">
        <form onSubmit={updateCustomer}>
          <div className="flex flex-wrap border-bottom-grey py-3 mb-5">
            <div className="w-full lg:w-12/12 px-4 mt-2">
              <h6 className="text-blueGray-600 text-sm mt-3 mb-6 font-bold uppercase">
                Customer Details
              </h6>
              {/* City / Country */}
              <div className="flex flex-wrap">
                {/* Name */}
                <div className="w-full lg:w-6/12 px-4 mb-3">
                  <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={customer.name}
                    onChange={changeCustomerFields}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                    placeholder="Enter name"
                  />
                </div>
                <div className="w-full lg:w-6/12 px-4 mb-3">
                  <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={customer.email}
                    onChange={changeCustomerFields}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                    placeholder="Enter email"
                  />
                </div>

                {/* Created Date */}
                <div className="w-full lg:w-6/12 px-4 mb-3">
                  <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                    Created Date
                  </label>
                  <input
                    type="datetime-local"
                    name="createdDate"
                    value={customer.createdDate}
                    onChange={changeCustomerFields}
                    className=" px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full"
                  />
                </div>
                <div className="w-full lg:w-6/12 px-4 mb-3">
                  <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                    Contact No
                  </label>
                  <input
                    type="text"
                    name="contactNo"
                    value={customer.contactNo}
                    onChange={changeCustomerFields}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                    placeholder="Enter contact no"
                  />
                </div>

                {/* National ID */}
                <div className="w-full lg:w-6/12 px-4 mb-3">
                  <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                    National ID
                  </label>
                  <input
                    name="nationalId"
                    value={customer.nationalId}
                    onChange={changeCustomerFields}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                    placeholder="Enter national ID"
                  />
                </div>

                {/* Next of Kin Name */}
                <div className="w-full lg:w-6/12 px-4 mb-3">
                  <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                    Next of Kin Name
                  </label>
                  <input
                    name="nextOFKinName"
                    value={customer.nextOFKinName}
                    onChange={changeCustomerFields}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                    placeholder="Enter next of kin name"
                  />
                </div>

                {/* Next of Kin National ID */}
                <div className="w-full lg:w-6/12 px-4 mb-3">
                  <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                    Next of Kin National ID
                  </label>
                  <input
                    name="nextOFKinNationalId"
                    value={customer.nextOFKinNationalId}
                    onChange={changeCustomerFields}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                    placeholder="Enter next of kin national ID"
                  />
                </div>

                {/* Relationship with Kin */}
                <div className="w-full lg:w-6/12 px-4 mb-3">
                  <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                    Relationship With Kin
                  </label>
                  <input
                    name="relationShipWithKin"
                    value={customer.relationShipWithKin}
                    onChange={changeCustomerFields}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                    placeholder="Enter relationship"
                  />
                </div>
                {/* Relationship with Kin */}
                <div className="w-full lg:w-6/12 px-4 mb-3">
                  <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                    Guardian Name
                  </label>
                  <input
                    name="guardianName"
                    value={customer.guardianName}
                    onChange={changeCustomerFields}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                    placeholder="Enter relationship"
                  />
                </div>

                {/* Address */}
                <div className="w-full lg:w-12/12 px-4 mb-3">
                  <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                    Address
                  </label>
                  <textarea
                    id="information"
                    rows="3"
                    name="address"
                    value={customer.address}
                    onChange={changeCustomerFields}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  ></textarea>
                </div>

                <div className="w-full lg:w-6/12 px-4 mb-3">
                  <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                    City
                  </label>
                  <input
                    name="city"
                    value={customer.city}
                    onChange={changeCustomerFields}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                    placeholder="Enter city"
                  />
                </div>

                <div className="w-full lg:w-6/12 px-4 mb-3">
                  <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                    Country
                  </label>
                  <input
                    name="country"
                    value={customer.country}
                    onChange={changeCustomerFields}
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                    placeholder="Enter country"
                  />
                </div>
                <div className="w-full lg:w-6/12 px-4 mb-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 mt-4 bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
                  >
                    <FaUserPlus
                      className="w-5 h-5 inline-block "
                      style={{ paddingBottom: "3px", paddingRight: "5px" }}
                    />
                    {loading ? "Saving..." : "Save Customer"}
                  </button>
                </div>
              </div>

              {/* TODO: Add dropdowns for projectId, floorId, unitId */}

              {/* <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white active:bg-blue-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
              ></button> */}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
