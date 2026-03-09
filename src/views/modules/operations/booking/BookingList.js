import React, { useEffect, useState, useContext } from "react";
import httpService from "../../../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../../../components/table/DynamicTableComponent.js";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min.js";
import { FaEye, FaPen, FaTrashAlt } from "react-icons/fa";
import { MdPrint } from "react-icons/md";
import { generateBookingHtml } from "utility/Utility.js";
import { getOrdinal } from "utility/Utility.js";
import { BsBuildingFillAdd } from "react-icons/bs";
import { MdSchedule, MdCancel } from "react-icons/md";
import CancelBookingModal from "./CancelBookingModal.js";
import "../../../../assets/styles/custom/uploadImage.css";

export default function BookingList() {
  const { loading, setLoading, notifyError, setBackdrop, backdrop } =
    useContext(MainContext);
  const history = useHistory();

  const [bookingList, setBookingList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filterProject, setFilterProject] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filterFloor, setFilterFloor] = useState("");
  const [fileteredId, setFileteredId] = useState("");
  const [filteredBy, setFilteredBy] = useState("organization");
  const [floorOptions, setFloorOptions] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState({
    booking: null,
    customerAccount: null,
  });

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchBookingList();
  }, [page, pageSize, filterProject, filterFloor]);

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

  const fetchBookingList = async () => {
    setLoading(true);
    try {
      const requestBody = {
        id: fileteredId,
        filteredBy: filteredBy,
        page,
        size: pageSize,
        sortBy: "id",
        sortDir: "desc",
      };

      if (!fileteredId) {
        let organizationLocal = JSON.parse(
          localStorage.getItem("organization")
        );
        if (organizationLocal) {
          requestBody.id = organizationLocal.organizationId;
        }
        requestBody.filteredBy = "organization";
      }

      const response = await httpService.post(`/booking/getByIds`, requestBody);

      setBookingList(response?.data?.content || []);
      setTotalPages(response?.data?.totalPages || 0);
      setTotalElements(response?.data?.totalElements || 0);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const changeSelectedProjected = (projectId) => {
    if (projectId) {
      setFileteredId(projectId);
      setFilteredBy("project");
      setFilterProject(projectId);
      fetchFloors(projectId);
    } else {
      setFileteredId("");
      setFilterProject("");
    }
  };

  const changeSelectedFloor = (floorId) => {
    if (floorId) {
      setFileteredId(floorId);
      setFilteredBy("floor");
      setFilterFloor(floorId);
    } else {
      setFileteredId(filterProject);
      setFilteredBy("project");
      setFilterFloor("");
      setFilterProject(Number(filterProject) + Number(0));
    }
  };

  const handleSchedule = async (unit) => {

    history.push("/dashboard/customer-schedule/" + unit?.unitId);
  };
  const tableColumns = [
    {
      header: "Image",
      field: "profileImageUrl",
      render: (value) => {
        let baseURL = httpService.BASE_URL.replace("/api", "");
        let preview = value && value !== "—" ? `${baseURL}${value}` : null;

        return (
          <div className="avatar-wrapper">
            {value != "—" ? (
              <img
                src={preview}
                alt="Customer"
                className="avatar-img"
                onError={(e) => {
                  // Prevent infinite loop
                  e.target.onerror = null;

                  // Hide broken image
                  e.target.style.display = "none";

                  // Show icon placeholder
                  const placeholder =
                    e.target.nextSibling || document.createElement("div");

                  placeholder.className = "avatar-placeholder";
                  placeholder.innerHTML =
                    '<i class="fas fa-user avatar-customer"></i>';

                  e.target.parentNode.appendChild(placeholder);
                }}
              />
            ) : (
              <div className="avatar-placeholder">
                <i className="fas fa-user avatar-customer"></i>
              </div>
            )}
          </div>
        );
      },
    },
    { header: "Customer Name", field: "customerName" },
    { header: "Customer Name", field: "customerName" },
    { header: "Unit Serial", field: "unitSerial" },
    { header: "Project", field: "project" },
    { header: "Floor No", field: "floorNo" },
    { header: "Total Amount", field: "totalAmount" },
    { header: "Created Date", field: "createdDate" },
  ];

  const onClickPrintBooking = async (data) => {
    const response = await httpService.get(
      `/booking/getDetailById/${data?.id}`
    );

    const unit = response?.data?.unit;
    const customer = response?.data?.customer;

    let orgName = "";
    const organization =
      JSON.parse(localStorage.getItem("organization")) || null;
    if (organization) {
      orgName = organization.name;
    }

    let baseURL = httpService.BASE_URL.replace("/api", "");
    let previewImage = customer?.profileImageUrl
      ? `${baseURL}${customer?.profileImageUrl}`
      : null;

    const formattedData = {
      orgName: orgName,
      projectName: data?.project,
      bookingNo: data?.id,
      customerNo: data?.customerId,
      serial: data?.unitSerial,
      type: unit?.unitType,
      floor: getOrdinal(data?.floorNo),
      size: unit?.squareFoot + " sqft",
      name: data?.customerName,
      guardianName: customer?.guardianName,
      postalAddress: customer?.address,
      residentialAddress: customer?.address,
      phone: customer?.contactNow9,
      email: customer?.email,
      age: customer?.age,
      nationality: "Pakistani",
      cnic: customer?.nationalId,
      nominee: customer?.nextOFKinName,
      nomineeRelation: customer?.relationShipWithKin,
      amount: unit?.amount,
      payOrderNo: "",
      bank: "",
      date: data?.createdDate?.split("T")[0],
      profileImageUrl: previewImage,
    };

    const win = window.open("", "_blank");
    const printContent = generateBookingHtml(formattedData);
    win.document.write(printContent);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  const onClickCancelBooking = async (data) => {
    const confirmed = window.confirm("Do you want to cancel the booking?");
    if (!confirmed) return;
    try {
      const response = await httpService.get(
        `/customerAccount/getByUnitId/${data?.unitId}`
      );
      let formattedData = { booking: data, customerAccount: response?.data };
      setSelectedBooking(formattedData);
      onClickToggleModal();
    } catch (err) {
      notifyError(err?.message, err?.data, 4000);
    }
  };

  const hanldeCustomerAccount = (customer) => {
    if (!customer) {
      return notifyError("Invalid Customer!", 4000);
    }
    history.push(`/dashboard/customer-account/?cId=${customer.customerId}`);
  };

  const handleEdit = (booking) => {
    history.push(`/dashboard/update-booking/${booking.id}`);
  };
  const handleAdd = (booking) => {
    history.push(`/dashboard/add-booking`);
  };

  const handleDelete = (floor) => {
    console.log("Delete Floor:", floor);
  };

  const actions = [
    {
      icon: FaEye,
      onClick: hanldeCustomerAccount,
      title: "Customer Account",
      className: "text-green-600",
    },
    {
      icon: MdSchedule,
      onClick: handleSchedule,
      title: "Payment Schedule",
      className: "text-blue-600",
    },
    { icon: FaPen, onClick: handleEdit, title: "Edit", className: "yellow" },
    {
      icon: MdPrint,
      onClick: onClickPrintBooking,
      title: "Print Slip",
      className: "yellow",
    },
    {
      icon: MdCancel,
      onClick: onClickCancelBooking,
      title: "Cancel Booking",
      className: "text-red-600",
    },
  ];

  const onClickToggleModal = () => {
    setBackdrop(!backdrop);
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="container mx-auto p-4">
        <div className="w-full">
          <div className="flex flex-wrap py-3 md:justify-content-between">
            <div className="bg-white shadow-lg p-5 rounded-12 lg:w-4/12 md:w-6/12 sm:w-12/12">
              <label className="block text-sm font-medium mb-1">Project</label>
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

            <div className="bg-white shadow-lg p-5 rounded-12 mx-4 lg:w-4/12 md:w-6/12 sm:w-12/12 md:mx-0 sm:mt-5">
              <label className="block text-sm font-medium mb-1">Floor</label>
              <select
                value={filterFloor}
                onChange={(e) => changeSelectedFloor(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full"
              >
                <option value="">All Floors</option>
                {filterProject &&
                  floorOptions.map((floor) => (
                    <option key={floor.id} value={floor.id}>
                      {floor.floorNo}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        {isOpen && selectedBooking?.booking ? (
          <CancelBookingModal
            selectedBooking={selectedBooking}
            isOpen={isOpen}
            onClose={onClickToggleModal}
          />
        ) : (
          <></>
        )}
      </div>
      <div className="container mx-auto p-4">
        <DynamicTableComponent
          fetchDataFunction={fetchBookingList}
          setPage={setPage}
          page={page}
          data={bookingList}
          columns={tableColumns}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalPages={totalPages}
          totalElements={totalElements}
          loading={loading}
          title="Booking List"
          firstButton={{
            title: "Create Booking",
            onClick: handleAdd,
            icon: BsBuildingFillAdd,
            className: "bg-emerald-500",
          }}
          actions={actions}
        />
      </div>
    </>
  );
}
