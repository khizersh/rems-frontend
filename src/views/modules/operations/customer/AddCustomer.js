import React, { useContext, useEffect, useState } from "react";
import { MainContext } from "context/MainContext";
import httpService from "../../../../utility/httpService.js";
import { FaUserPlus, FaUser, FaAddressCard, FaMapMarkerAlt, FaCamera } from "react-icons/fa";
import { IoArrowBackOutline } from "react-icons/io5";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min.js";
import "../../../../assets/styles/custom/uploadImage.css";

export default function AddCustomer() {
  const { loading, setLoading, notifyError, notifySuccess, notifyWarning } =
    useContext(MainContext);

  const [customer, setCustomer] = useState({
    name: "",
    country: "",
    city: "",
    address: "",
    age: "",
    nationalId: "",
    nextOFKinName: "",
    contactNo: "",
    guardianName: "",
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
    createdDate: new Date().toISOString().slice(0, 16),
    updatedDate: null,
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

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
      createdDate: new Date().toISOString().slice(0, 16),
      updatedDate: null,
    });
    setProfileImage(null);
    setImagePreview(null);
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
      const organization =
        JSON.parse(localStorage.getItem("organization")) || {};
      customer.floorId = filterFloor;
      customer.projectId = filterProject;
      customer.unitId = selectedUnit;
      customer.updatedDate = customer.createdDate;
      customer.organizationId = organization?.organizationId;

      const response = await httpService.post(
        `/customer/addCustomer`,
        customer
      );

      const createdCustomer = response.data;

      if (profileImage && createdCustomer?.customerId) {
        const formData = new FormData();
        formData.append("image", profileImage);

        const response = await fetch(
          `${httpService.BASE_URL}/customer/${createdCustomer?.customerId}/upload-image`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`, // JWT only
              // ❌ DO NOT set Content-Type
            },
            body: formData,
          }
        );

        const data = await response.json();

        if (data?.responseCode == "0000") {
          notifySuccess(
            data?.responseMessage || "Customer updated successfully!",
            4000
          );
        } else {
          notifyWarning(
            "Customer updated successfully!",
            data?.responseMessage,
            4000
          );
        }
      } else {
        notifySuccess(
          response.responseMessage || "Customer added successfully!",
          4000
        );
      }

      resetState();
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const history = useHistory();

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleImageSelect = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notifyError("Please upload a valid image");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      notifyError("Image must be under 2MB");
      return;
    }

    setProfileImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 border-0">
      {/* Header */}
      <div className="mb-4 py-4">
        <h6 className="text-blueGray-700 text-lg font-bold uppercase flex items-center">
          <button onClick={() => history.goBack()} className="mr-3">
            <IoArrowBackOutline className="text-xl" style={{ color: "#64748b" }} />
          </button>
          <FaUserPlus className="mr-2" style={{ color: "#10b981" }} />
          Add Customer
        </h6>
      </div>

      <form onSubmit={createCustomer} className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6">
          {/* Profile Image Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
              <FaCamera className="mr-2" style={{ fontSize: "14px", color: "#6366f1" }} />
              Profile Image
            </h3>
            <div className="flex flex-wrap -mx-2">
              <div className="w-full px-2">
                <div className="profile-upload-wrapper">
                  <div className="profile-container">
                    {imagePreview && (
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          setImagePreview(null);
                          setProfileImage(null);
                        }}
                      >
                        <i
                          className="fas fa-times remove-image-btn"
                          aria-hidden="true"
                        ></i>
                      </button>
                    )}

                    <label
                      className={`profile-upload ${
                        isDragging ? "dragging" : ""
                      }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          handleImageSelect(e.dataTransfer.files[0]);
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageSelect(e.target.files[0])}
                        />

                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="profile-preview"
                          />
                        ) : (
                          <div className="profile-placeholder">
                            <span>📷</span>
                            Select/Drag Profile Image
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>
          </div>

          {/* Personal Information Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
              <FaUser className="mr-2" style={{ fontSize: "14px", color: "#6366f1" }} />
              Personal Information
            </h3>
            <div className="flex flex-wrap -mx-2">
              {/* Name */}
              <div className="w-full lg:w-4/12 px-2 mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={customer.name}
                  onChange={changeCustomerFields}
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="Enter name"
                />
              </div>

              {/* Email */}
              <div className="w-full lg:w-4/12 px-2 mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={customer.email}
                  onChange={changeCustomerFields}
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="Enter email"
                />
              </div>

              {/* Username */}
              <div className="w-full lg:w-4/12 px-2 mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={customer.username}
                  onChange={changeCustomerFields}
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="Enter username"
                />
              </div>

              {/* Contact No */}
              <div className="w-full lg:w-4/12 px-2 mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Contact No
                </label>
                <input
                  type="text"
                  name="contactNo"
                  value={customer.contactNo}
                  onChange={changeCustomerFields}
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="Enter contact no"
                />
              </div>

              {/* Age */}
              <div className="w-full lg:w-4/12 px-2 mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={customer.age}
                  onChange={changeCustomerFields}
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="Enter age"
                />
              </div>

              {/* National ID */}
              <div className="w-full lg:w-4/12 px-2 mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  National ID
                </label>
                <input
                  type="text"
                  name="nationalId"
                  value={customer.nationalId}
                  onChange={changeCustomerFields}
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="Enter national ID"
                />
              </div>

              {/* Created Date */}
              <div className="w-full lg:w-4/12 px-2 mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Created Date
                </label>
                <input
                  type="datetime-local"
                  name="createdDate"
                  value={customer.createdDate}
                  onChange={changeCustomerFields}
                  className="w-full p-2 border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Guardian/Kin Details Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
              <FaAddressCard className="mr-2" style={{ fontSize: "14px", color: "#10b981" }} />
              Guardian/Kin Details
            </h3>
            <div className="flex flex-wrap -mx-2">
              {/* Guardian Name */}
              <div className="w-full lg:w-6/12 px-2 mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Guardian Name
                </label>
                <input
                  type="text"
                  name="guardianName"
                  value={customer.guardianName}
                  onChange={changeCustomerFields}
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="Enter guardian name"
                />
              </div>

              {/* Next of Kin Name */}
              <div className="w-full lg:w-6/12 px-2 mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Next of Kin Name
                </label>
                <input
                  type="text"
                  name="nextOFKinName"
                  value={customer.nextOFKinName}
                  onChange={changeCustomerFields}
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="Enter next of kin name"
                />
              </div>

              {/* Next of Kin National ID */}
              <div className="w-full lg:w-6/12 px-2 mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Next of Kin National ID
                </label>
                <input
                  type="text"
                  name="nextOFKinNationalId"
                  value={customer.nextOFKinNationalId}
                  onChange={changeCustomerFields}
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="Enter next of kin national ID"
                />
              </div>

              {/* Relationship With Kin */}
              <div className="w-full lg:w-6/12 px-2 mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Relationship With Kin
                </label>
                <input
                  type="text"
                  name="relationShipWithKin"
                  value={customer.relationShipWithKin}
                  onChange={changeCustomerFields}
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="Enter relationship"
                />
              </div>
            </div>
          </div>

          {/* Address Information Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
              <FaMapMarkerAlt className="mr-2" style={{ fontSize: "14px", color: "#f59e0b" }} />
              Address Information
            </h3>
            <div className="flex flex-wrap -mx-2">
              {/* Address */}
              <div className="w-full px-2 mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  id="information"
                  rows="3"
                  name="address"
                  value={customer.address}
                  onChange={changeCustomerFields}
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="Enter address"
                ></textarea>
              </div>

              {/* City */}
              <div className="w-full lg:w-6/12 px-2 mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={customer.city}
                  onChange={changeCustomerFields}
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="Enter city"
                />
              </div>

              {/* Country */}
              <div className="w-full lg:w-6/12 px-2 mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={customer.country}
                  onChange={changeCustomerFields}
                  className="w-full p-2 border rounded-lg text-sm"
                  placeholder="Enter country"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => history.goBack()}
              className="bg-gray-100 text-gray-700 font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-md hover:bg-gray-200 transition-all mr-3 inline-flex items-center"
            >
              <IoArrowBackOutline className="mr-1" style={{ color: "#64748b" }} />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              <FaUserPlus className="mr-1" style={{ color: "white" }} />
              {loading ? "Saving..." : "Save Customer"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
