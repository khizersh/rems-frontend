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
import { RiFolderReceivedFill } from "react-icons/ri";

export default function VendorAccount() {
  const {
    loading,
    setLoading,
    notifySuccess,
    notifyError,
    backdrop,
    setBackdrop,
  } = useContext(MainContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const { floorId } = useParams();
  const history = useHistory();

  const [accountList, setAccountList] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const fetchVendorList = async () => {
    setLoading(true);
    try {
      let organizationLocal = JSON.parse(localStorage.getItem("organization"));
      if (organizationLocal) {
        const requestBody = {
          id: organizationLocal.organizationId,
          page,
          size: pageSize,
          sortBy: "createdDate",
          sortDir: "desc",
        };

        const response = await httpService.post(
          `/vendorAccount/getVendorAccountsByOrgId`,
          requestBody
        );

        setAccountList(response?.data?.content || []);
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
    fetchVendorList();
  }, [page]);

  const tableColumns = [
    { header: "Vendor Title", field: "name" },
    { header: "Total Amount Paid", field: "totalAmountPaid" },
    { header: "Total Credit Amount", field: "totalCreditAmount" },
    // { header: "Total Balance Amount", field: "totalBalanceAmount" },
    { header: "Total Amount", field: "totalAmount" },
    { header: "Last Updated", field: "lastUpdatedDateTime" },
  ];

  const handleView = (data) => {
    const formattedUnitDetails = {
      "Account Detail": {
        "Account Title": data?.name,
        "Total Amount Paid": data?.totalAmountPaid,
        "Total Credit Amount": data?.totalCreditAmount,
        // "Total Balance Amount": data?.totalBalanceAmount,
        "Total Amount": data?.totalAmount,
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

  const handleEdit = (data) => {
    if (!data) {
      return notifyError("Invalid Account!", 4000);
    }
    history.push(`/dashboard/update-vendor-account/${data.id}`);
  };

  const handleDelete = async (data) => {
    try {
      const confirmed = window.confirm("Are you sure to Delete this Vendor?");
      if (!confirmed) return;

      setLoading(true);
      const response = await httpService.get(
        `/vendorAccount/deleteById/${data?.id}`
      );
      notifySuccess(response.responseMessage, 3000);

      await fetchVendorList();
      setLoading(false);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
      setLoading(false);
    }
  };

  const handleViewAccountDetail = (data) => {
    if (!data) {
      return notifyError("Invalid Account!", 4000);
    }
    history.push(`/dashboard/vendor-account-detail/${data.id}`);
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

  const handleAddAccount = () => {
    history.push("/dashboard/add-vendor-account");
  };

  return (
    <div className="container mx-auto p-4">
      <DynamicDetailsModal
        isOpen={isModalOpen}
        onClose={toggleModal}
        data={selectedUnit}
        title="Vendor Account Detail"
      />
      <DynamicTableComponent
        fetchDataFunction={fetchVendorList}
        setPage={setPage}
        page={page}
        data={accountList}
        columns={tableColumns}
        pageSize={pageSize}
        totalPages={totalPages}
        totalElements={totalElements}
        loading={loading}
        title="Vendor Account"
        actions={actions}
        firstButton={{
          title: "Add Account",
          onClick: handleAddAccount,
          icon: RiFolderReceivedFill,
          className: "bg-emerald-500",
        }}
      />
    </div>
  );
}
