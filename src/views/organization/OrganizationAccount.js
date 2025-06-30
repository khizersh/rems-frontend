import React, { useEffect, useState, useContext } from "react";
import httpService from "../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../components/table/DynamicTableComponent.js";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min.js";
import { FaEye, FaPen, FaTrashAlt } from "react-icons/fa";
import DynamicDetailsModal from "components/CustomerComponents/DynamicModal.js";

export default function OrganizationAccount() {
  const { loading, setLoading, notifyError, backdrop, setBackdrop } =
    useContext(MainContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const { floorId } = useParams();
  const history = useHistory();

  const [accountList, setAccountList] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const fetchAccountList = async () => {
    setLoading(true);
    try {
      let organizationLocal = JSON.parse(localStorage.getItem("organization"));
      if (organizationLocal) {
        const response = await httpService.get(
          `/organizationAccount/getAccountByOrgId/${organizationLocal.organizationId}`
        );

        setAccountList(response?.data || []);
        setTotalPages(response?.data?.totalPages || 0);
        setTotalElements(response?.data?.totalElements || 0);
      }
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountList();
  }, [page]);

  const tableColumns = [
    { header: "Account Title", field: "name" },
    { header: "Bank Name", field: "bankName" },
    { header: "Account No", field: "accountNo" },
    { header: "IBAN", field: "iban" },
    { header: "Account Balance", field: "totalAmount" },
    { header: "Last Updated", field: "lastUpdatedDateTime" },
  ];

  const handleView = (data) => {
    const formattedUnitDetails = {
      "Account Detail": {
        "Account Title": data?.name,
        "Bank Name": data?.bankName,
        "Account No": data?.accountNo,
        IBAN: data?.iban,
        "Account Balance": data?.totalAmount,
      },
      "Audit Info": {
        "Last Updated": data?.lastUpdatedDateTime,
        "Created By": data?.createdBy,
        "Created Date": data?.createdDate,
        "Updated By": data?.updatedBy,
        "Updated Date": data?.updatedDate,
      },
    };
    setSelectedUnit(formattedUnitDetails);
    toggleModal();
  };

  const handleEdit = (floor) => {
    console.log("Edit Floor:", floor);
    // Implement edit functionality
  };

  const handleDelete = (floor) => {
    console.log("Delete Floor:", floor);
    // Implement delete logic
  };
  const handleViewAccountDetail = (data) => {
    console.log("data :: ", data);

    if (!data) {
      return notifyError("Invalid Account!", 4000);
    }
    history.push(`/dashboard/organization-account-detail/${data.id}`);
  };

  const actions = [
    {
      icon: FaEye,
      onClick: handleView,
      title: "View Detail",
      className: "text-green-600",
    },
    {
      icon: FaEye,
      onClick: handleViewAccountDetail,
      title: "View Account Detail",
      className: "text-green-600",
    },
    { icon: FaPen, onClick: handleEdit, title: "Edit", className: "yellow" },
    {
      icon: FaTrashAlt,
      onClick: handleDelete,
      title: "Delete",
      className: "text-red-600",
    },
  ];

  const toggleModal = () => {
    setBackdrop(!backdrop);
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="container mx-auto p-4">
      <DynamicDetailsModal
        isOpen={isModalOpen}
        onClose={toggleModal}
        data={selectedUnit}
        title="Organization Account Detail"
      />
      <DynamicTableComponent
        fetchDataFunction={fetchAccountList}
        setPage={setPage}
        page={page}
        data={accountList}
        columns={tableColumns}
        pageSize={pageSize}
        totalPages={totalPages}
        totalElements={totalElements}
        loading={loading}
        title="Organization Account Detail"
        actions={actions}
      />
    </div>
  );
}
