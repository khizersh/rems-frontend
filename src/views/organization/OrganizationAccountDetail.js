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

export default function OrganizationAccountDetail() {
  const { loading, setLoading, notifyError, backdrop, setBackdrop } =
    useContext(MainContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const { accountId } = useParams();

  const [accountDetailList, setAccountDetailList] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const fetchAccountList = async () => {
    setLoading(true);
    try {
      const requestBody = {
        id: accountId,
        page,
        size: pageSize,
        sortBy: "createdDate",
        sortDir: "desc",
      };

      const response = await httpService.post(
        `/organizationAccount/getAccountDetailByAcctId`,
        requestBody
      );

      setAccountDetailList(response?.data?.content || []);
      setTotalPages(response?.data?.totalPages || 0);
      setTotalElements(response?.data?.totalElements || 0);
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
    { header: "Customer Name", field: "customerName" },
    { header: "Project Name", field: "projectName" },
    { header: "Unit Serial", field: "unitSerialNo" },
    { header: "Transaction Type", field: "transactionType" },
    { header: "Amount", field: "amount" },
    { header: "Comments", field: "comments" },
  ];

  const handleView = (data) => {
    const formattedAccountDetail = {
      "Transaction Info": {
        "Transaction Type": data.transactionType,
        Amount: data.amount,
        Comments: data.comments,
      },
      "Customer Info": {
        "Customer Name": data.customerName,
        "Unit Serial No": data.unitSerialNo,
      },
      "Project Info": {
        "Project ID": data.projectId,
        "Project Name": data.projectName,
      },
      "Audit Info": {
        "Created By": data.createdBy,
        "Created Date": data.createdDate,
        "Updated By": data.updatedBy,
        "Updated Date": data.updatedDate,
      },
    };
    setSelectedUnit(formattedAccountDetail);
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

  const actions = [
    {
      icon: FaEye,
      onClick: handleView,
      title: "View Detail",
      className: "text-green-600",
    }
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
        data={accountDetailList}
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
