import React, { useContext, useEffect, useState } from "react";
import { MainContext } from "context/MainContext";
import httpService from "../../utility/httpService.js";
import { BsBuildingFillAdd } from "react-icons/bs";
import { FaUserPlus } from "react-icons/fa";

export default function AddCustomer() {
  const { loading, setLoading, notifyError, notifySuccess } =
    useContext(MainContext);

  const [customer, setCustomer] = useState({
    name: "",
    country: "",
    city: "",
    address: "",
    nationalId: "",
    nextOFKinName: "",
    contactNo: "",
    guardianName:"",
    nextOFKinNationalId: "",
    relationShipWithKin: "",
    organizationId: 1, // default org id
    projectId: 0,
    floorId: 0,
    unitId: 0,
    createdBy: "admin", // assuming static for now
    updatedBy: "admin",
    email: "",
    username: "",
    password: "",
  });
  const [projects, setProjects] = useState([]);
  const [filterProject, setFilterProject] = useState("");
  const [filterFloor, setFilterFloor] = useState("");
  const [fileteredId, setFileteredId] = useState("");
  const [filteredBy, setFilteredBy] = useState("organization");
  const [floorOptions, setFloorOptions] = useState([]);
  const [unitList, setUnitList] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const resetState = () => {
    setCustomer({
      name: "",
      country: "",
      city: "",
      address: "",
      contactNo: "",
      nationalId: "",
      guardianName: "",
      nextOFKinName: "",
      nextOFKinNationalId: "",
      relationShipWithKin: "",
      organizationId: 1,
      projectId: 0,
      floorId: 0,
      unitId: 0,
      createdBy: "admin",
      updatedBy: "admin",
      email: "",
      username: "",
      password: "",
    });
  };

  const fetchProjects = async () => {
    try {
      const sidebarData =
        JSON.parse(localStorage.getItem("organization")) || null;
      if (sidebarData) {
        const response = await httpService.get(
          `/project/getAllProjectByOrg/${sidebarData.organizationId}`
        );
        setProjects(response.data || []);
      }
    } catch (err) {
      notifyError("Failed to load projects", 4000);
    }
  };

  const fetchFloors = async (projectId) => {
    try {
      const response = await httpService.get(
        `/floor/getAllFloorsByProject/${projectId}`
      );
      setFloorOptions(response.data || []);
    } catch (err) {
      notifyError("Failed to load floors", 4000);
    }
  };
  const fetchUnits = async (floorId) => {
    try {
      const response = await httpService.get(
        `/unit/getIdSerialByFloorId/${floorId}`
      );
      setUnitList(response.data || []);
    } catch (err) {
      notifyError("Failed to load floors", 4000);
    }
  };

  const changeSelectedProjected = (projectId) => {
    if (projectId) {
      setFileteredId(projectId);
      setFilteredBy("project");
      setFilterProject(projectId);
      fetchFloors(projectId);
    }
  };

  const changeSelectedFloor = (floorId) => {
    if (floorId) {
      setFileteredId(floorId);
      setFilteredBy("floor");
      setFilterFloor(floorId);
      fetchUnits(floorId);
    }
  };

  const changeCustomerFields = (e) => {
    const { name, value } = e.target;
    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const createCustomer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      customer.floorId = filterFloor;
      customer.projectId = filterProject;
      customer.unitId = selectedUnit;

      console.log("customer :: ", customer);
      const response = await httpService.post(
        `/customer/addCustomer`,
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
    fetchProjects();
  }, []);

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 md:px-0">
      <div className="mb-0 px-4 py-6">
        <div className="flex justify-between">
          <h6 className="text-blueGray-700 text-xl font-bold uppercase">
            Add Customer
          </h6>
        </div>
      </div>
      <div className="flex flex-wrap md:justify-content-between px-4 py-6 md:pt-0">

        <div className="bg-white shadow-lg p-5 rounded-12 lg:w-3/12 md:w-6/12 sm:w-12/12 md:mx-0 md:mt-5">
          <label className="block text-sm font-medium mb-1 ">
            Select Project
          </label>
          <select
            value={filterProject}
            onChange={(e) => changeSelectedProjected(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full"
          >
            <option value="">All Projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white shadow-lg p-5 rounded-12 lg:w-3/12 mx-4 md:w-6/12 sm:w-12/12 md:mx-0 md:mt-5 ">
          <label className="block text-sm font-medium mb-1">Select Floor</label>
          <select
            value={filterFloor}
            onChange={(e) => changeSelectedFloor(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full"
          >
            <option value="">All Floors</option>
            {floorOptions.map((floor) => (
              <option key={floor.id} value={floor.id}>
                {floor.floorNo}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white shadow-lg p-5 rounded-12 lg:w-3/12 md:w-6/12 sm:w-12/12 md:mx-0 md:mt-5 lg:mt-5">
          <label className="block text-sm font-medium mb-1">Select Unit</label>
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full"
          >
            <option value="">All Floors</option>
            {unitList.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.serialNo}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={createCustomer} className="mt-6">
          <div className="flex flex-wrap border-bottom-grey py-3 mb-5 mt-5 bg-white rounded-12 shadow-lg">
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
                    className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full"
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
                    className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full"
                    placeholder="Enter email"
                  />
                </div>

                {/* Username */}
                <div className="w-full lg:w-6/12 px-4 mb-3">
                  <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                    Username
                  </label>
                  <input
                   type="text"
                    name="username"
                    value={customer.username}
                    onChange={changeCustomerFields}
                    className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full"
                    placeholder="Enter username"
                  />
                </div>
                {/* Username */}
                <div className="w-full lg:w-6/12 px-4 mb-3">
                  <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                    Contact No
                  </label>
                  <input
                   type="text"
                    name="contactNo"
                    value={customer.contactNo}
                    onChange={changeCustomerFields}
                    className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full"
                    placeholder="Enter contactNo"
                  />
                </div>

                {/* National ID */}
                <div className="w-full lg:w-6/12 px-4 mb-3">
                  <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                    National ID
                  </label>
                  <input
                   type="text"
                    name="nationalId"
                    value={customer.nationalId}
                    onChange={changeCustomerFields}
                    className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full"
                    placeholder="Enter national ID"
                  />
                </div>
                {/* National ID */}
                <div className="w-full lg:w-6/12 px-4 mb-3">
                  <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                    Guardian Name
                  </label>
                  <input
                   type="text"
                    name="guardianName"
                    value={customer.guardianName}
                    onChange={changeCustomerFields}
                    className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full"
                    placeholder="Enter national ID"
                  />
                </div>

                {/* Next of Kin Name */}
                <div className="w-full lg:w-6/12 px-4 mb-3">
                  <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                    Next of Kin Name
                  </label>
                  <input
                   type="text"
                    name="nextOFKinName"
                    value={customer.nextOFKinName}
                    onChange={changeCustomerFields}
                    className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full"
                    placeholder="Enter next of kin name"
                  />
                </div>

                {/* Next of Kin National ID */}
                <div className="w-full lg:w-6/12 px-4 mb-3">
                  <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                    Next of Kin National ID
                  </label>
                  <input
                   type="text"
                    name="nextOFKinNationalId"
                    value={customer.nextOFKinNationalId}
                    onChange={changeCustomerFields}
                    className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full"
                    placeholder="Enter next of kin national ID"
                  />
                </div>

                {/* Relationship with Kin */}
                <div className="w-full lg:w-6/12 px-4 mb-3">
                  <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                    Relationship With Kin
                  </label>
                  <input
                   type="text"
                    name="relationShipWithKin"
                    value={customer.relationShipWithKin}
                    onChange={changeCustomerFields}
                    className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full"
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
                    className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  ></textarea>
                </div>

                <div className="w-full lg:w-6/12 px-4 mb-3">
                  <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                    City
                  </label>
                  <input
                   type="text"
                    name="city"
                    value={customer.city}
                    onChange={changeCustomerFields}
                    className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full"
                    placeholder="Enter city"
                  />
                </div>

                <div className="w-full lg:w-6/12 px-4 mb-3">
                  <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                    Country
                  </label>
                  <input
                   type="text"
                    name="country"
                    value={customer.country}
                    onChange={changeCustomerFields}
                    className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full"
                    placeholder="Enter country"
                  />
                </div>

                <div className="w-full lg:w-12/12 px-4 mb-3 text-right">
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
