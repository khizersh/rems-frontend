import React, { useContext, useState, useEffect } from "react";
import { MainContext } from "context/MainContext";
import httpService from "../../../../utility/httpService.js";
import { BsBuildingFillAdd } from "react-icons/bs";

export default function UpdateOrganization() {
  const { loading, setLoading, notifyError, notifySuccess } =
    useContext(MainContext);

  const [organization, setOrganization] = useState({
    organizationId: 0,
    name: "",
    address: "",
    logo: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOrganization((prev) => ({ ...prev, [name]: value }));
  };

  const updateOrganization = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await httpService.post(
        "/organization/update",
        organization
      );
      notifySuccess("Organization updated successfully", 4000);
    } catch (err) {
      notifyError(err.message || "Failed to update organization", 4000);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const organizationLocal =
        JSON.parse(localStorage.getItem("organization")) || null;
      const organizationId = organizationLocal.organizationId;
      const response = await httpService.get(
        `/organization/getOrganization/${organizationId}`
      );

      setOrganization(response.data);
    } catch (err) {
      notifyError(err.message || "Failed to get organization", 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  return (
    <div className="relative flex flex-col w-full mb-6 shadow-lg rounded-lg border-0">
      <div className="rounded-t bg-white mb-0 px-6 py-6">
        <div className="flex justify-between">
          <h6 className="text-blueGray-700 text-xl font-bold uppercase">
            Update Organization
          </h6>
        </div>
      </div>
      <form onSubmit={updateOrganization}>
        <div className="bg-white py-5 px-6">
          <div className="flex flex-wrap -mx-4">
            {/* Name */}
            <div className="w-full lg:w-6/12 px-4 mb-4">
              <label className="block text-xs font-bold mb-2">Name</label>
              <input
                name="name"
                value={organization.name}
                onChange={handleChange}
                className="border px-3 py-2 rounded w-full"
                placeholder="Organization Name"
              />
            </div>

            {/* Address */}
            <div className="w-full lg:w-6/12 px-4 mb-4">
              <label className="block text-xs font-bold mb-2">Address</label>
              <input
                name="address"
                value={organization.address}
                onChange={handleChange}
                className="border px-3 py-2 rounded w-full"
                placeholder="Address"
              />
            </div>

            {/* Logo */}
            <div className="w-full lg:w-12/12 px-4 mb-4">
              <label className="block text-xs font-bold mb-2">Logo URL</label>
              <input
                name="logo"
                value={organization.logo}
                onChange={handleChange}
                className="border px-3 py-2 rounded w-full"
                placeholder="Logo URL"
              />
              <div className="mt-2">
                <img
                  src={organization.logo}
                  alt="Logo Preview"
                  className="w-32 h-auto rounded shadow"
                />
              </div>
            </div>

            <div className="w-full px-4 mt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow hover:shadow-md"
              >
                <BsBuildingFillAdd className="inline-block mr-2" />
                {loading ? "Updating..." : "Update Organization"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
