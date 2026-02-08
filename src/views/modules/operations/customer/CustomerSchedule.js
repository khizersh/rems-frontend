import PaymentSchedule from "components/PaymentSchedule/PaymentSchedule";
import { MainContext } from "context/MainContext";
import React, { useContext, useEffect, useState } from "react";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";
import httpService from "utility/httpService";
import { GoSearch } from "react-icons/go";
import { IoArrowBackOutline } from "react-icons/io5";

const CustomerSchedule = () => {
  const { setLoading, notifyError } = useContext(MainContext);
  const [filterProject, setFilterProject] = useState("");
  const [filterFloor, setFilterFloor] = useState("");
  const [filterUnit, setFilterUnit] = useState("");
  const [projects, setProjects] = useState([]);
  const [floors, setFloors] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedCustomerAccount, setSelectedCustomerAccount] = useState(null);
  const [customerAccountList, setCustomerAccountList] = useState([]);
  const [selectedType, setSelectedType] = useState("Both");

  const { unitID } = useParams();

  const fetchProjects = async () => {
    try {
      const organization =
        JSON.parse(localStorage.getItem("organization")) || null;
      if (organization) {
        const response = await httpService.get(
          `/project/getAllProjectByOrg/${organization.organizationId}`
        );
        setProjects(response.data || []);
      }
    } catch (err) {
      // notifyError(err.message, err.data, 4000);
    }
  };

  const fetchCustomerAccountList = async (id, filteredBy) => {
    setLoading(true);
    try {
      let request = {
        id: id,
        filteredBy: filteredBy,
      };

      const response = await httpService.post(
        `/customerAccount/getNameIdsByIds`,
        request
      );

      setCustomerAccountList(response.data || []);
    } catch (err) {
      // notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const changeSelectedProjected = async (projectId) => {
    if (projectId) {
      setFloors([]);
      setFilterProject(projectId);

      const response = await httpService.get(
        `/floor/getAllFloorsByProject/${projectId}`
      );
      setFloors(response.data || []);

      // fetchCustomerAccountList(projectId, "project");
    }
  };

  const changeSelectedFloor = async (floorId) => {
    if (floorId) {
      setUnits([]);
      setFilterFloor(floorId);

      const response = await httpService.get(
        `/unit/getAllIdSerialByFloorId/${floorId}`
      );

      setUnits(response.data || []);

      // fetchCustomerAccountList(projectId, "project");
    }
  };
  const changeSelectedUnit = async (unitId) => {
    if (unitId) {
      setFilterUnit(unitId);
    }
  };

  const onClickSearch = async () => {
    setLoading(true);
    try {
      const validations = [
        {
          value: filterProject,
          title: "Invalid Selection",
          message: "Please select Project",
        },
        {
          value: filterFloor,
          title: "Invalid Selection",
          message: "Please select Floor",
        },
        {
          value: filterUnit,
          title: "Invalid Selection",
          message: "Please select Unit",
        },
        {
          value: selectedType,
          title: "Invalid Selection",
          message: "Please select Booking Type",
        },
      ];

      for (const v of validations) {
        if (!v.value) {
          setLoading(false);
          return notifyError(v.title, v.message, 4000);
        }
      }

      const response = await httpService.get(
        `/paymentSchedule/getByUnit/${filterUnit}`
      );

      console.log("response :: ", response);

      setLoading(false);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
      setLoading(false);
    }
  };

  useEffect(() => {
    let organizationLocal = JSON.parse(localStorage.getItem("organization"));
    if (organizationLocal) {
      fetchCustomerAccountList(
        organizationLocal.organizationId,
        "organization"
      );
    }
    fetchProjects();
  }, []);

  const history = useHistory();

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-wrap bg-white shadow-lg p-5 rounded-12">
        <div className="w-full md:w-12/12 mb-5">
          <div className="flex justify-between">
            <div>
              <button className="">
                <IoArrowBackOutline
                  onClick={() => history.goBack()}
                  className="back-button-icon inline-block back-button"
                  style={{ paddingBottom: "3px", paddingRight: "7px" }}
                />
              </button>
            </div>
            <div className="flex justify-end">
              {["Booked", "Non Booked", "Both"].map((item) => (
                <div className="mr-4">
                  <label
                    key={item}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="customerType"
                      value={item}
                      checked={selectedType === item}
                      onChange={() => setSelectedType(item)}
                    />
                    <span>{item}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:w-6/12 md:w-6/12 sm:w-12/12  mb-3">
          <label className="block text-sm font-medium mb-1">Project</label>
          <select
            value={filterProject}
            onChange={(e) => changeSelectedProjected(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="">All Projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
        <div className="lg:w-6/12 md:w-6/12 sm:w-12/12 mb-3 px-4 max-sm-px-0">
          <label className="block text-sm font-medium mb-1">Floor</label>
          <select
            value={filterFloor}
            onChange={(e) => changeSelectedFloor(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="">All Floors</option>
            {floors.map((floor) => (
              <option key={floor.id} value={floor.id}>
                {floor.floorNo}
              </option>
            ))}
          </select>
        </div>
        <div className="lg:w-6/12 md:w-6/12 sm:w-12/12 mb-3 ">
          <label className="block text-sm font-medium mb-1">Unit</label>
          <select
            value={filterUnit}
            onChange={(e) => changeSelectedUnit(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="">All Units</option>
            {units.map((unit) => {
              if (selectedType == "Booked" && unit.booked === true) {
                return (
                  <option key={unit.id} value={unit.id}>
                    {unit.serialNo}
                  </option>
                );
              } else if (
                selectedType == "Non Booked" &&
                unit.booked === false
              ) {
                return (
                  <option key={unit.id} value={unit.id}>
                    {unit.serialNo}
                  </option>
                );
              } else if (selectedType == "Both") {
                return (
                  <option key={unit.id} value={unit.id}>
                    {unit.serialNo}
                  </option>
                );
              }
            })}
          </select>
        </div>
        <div className="lg:w-6/12 md:w-6/12 sm:w-12/12 px-4 mb-3">
          <button
            onClick={onClickSearch}
            type="submit"
            className="mt-7 ml-1 bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
          >
            <GoSearch
              className="w-5 h-5 inline-block "
              style={{ paddingBottom: "3px", paddingRight: "5px" }}
            />
            Search
          </button>
        </div>
      </div>

      <div className="mt-5">
        <PaymentSchedule
          unitId={!filterUnit ? (unitID ? unitID : filterUnit) : filterUnit}
        />
      </div>
    </div>
  );
};

export default CustomerSchedule;
