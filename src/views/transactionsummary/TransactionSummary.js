import React, { useEffect, useState, useContext } from "react";
import httpService from "../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min.js";
import DynamicDetailsModal from "components/CustomerComponents/DynamicModal.js";
import { FaEye, FaPen, FaTrashAlt } from "react-icons/fa";
import DynamicTableComponentDateRange from "../../components/table/DynamicTableComponentDateRange.js";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min.js";
import { getFormattedDateNDaysAgo } from "utility/Utility.js";

export default function TransactionSummary() {
  const {
    loading,
    backdrop,
    setBackdrop,
    setLoading,
    notifyError,
    notifySuccess,
  } = useContext(MainContext);
  const location = useLocation();

  const history = useHistory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cId, setCId] = useState(null);
  const [selectTransactionType, setSelectTransactionType] = useState("CREDIT");
  const [isModalOpenAccount, setIsModalOpenAccount] = useState(false);
  const [customerList, setCustomerList] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState({});
  const [selectedCustomerAccount, setSelectedCustomerAccount] = useState({});
  const [accounts, setAccounts] = useState([]);
  const [accountDetailList, setAccountDetailList] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [filterProject, setFilterProject] = useState("");
  const [filterFloor, setFilterFloor] = useState("");
  const [fileteredId, setFileteredId] = useState(null);
  const [filteredBy, setFilteredBy] = useState("organization");
  const [accountDetailRequest, setAccountDetailRequest] = useState({
    organizationId: 0,
    startDate: null,
    endDate: null,
    filteredId: null,
    transactionType: "CREDIT",
    filteredBy: "all",
    page: 0,
    size: 10,
    sortBy: "createdDate",
    sortDir: "desc",
  });

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;
  const [startDate, endDate] = dateRange;

  const fetchOrgAccountDetails = async (fileteredId) => {
    try {
      setLoading(true);
      const organization =
        JSON.parse(localStorage.getItem("organization")) || null;
      if (organization) {
        accountDetailRequest.organizationId = organization.organizationId;

        if (!accountDetailRequest.startDate || !accountDetailRequest.endDate) {
          accountDetailRequest.startDate = getFormattedDateNDaysAgo(0);
          accountDetailRequest.endDate = getFormattedDateNDaysAgo(0);
        }

        accountDetailRequest.filteredBy = "all";
        if (fileteredId) {
          accountDetailRequest.filteredBy = "account";
          accountDetailRequest.filteredId = fileteredId;
        }

        console.log("accountDetailRequest :: ", accountDetailRequest);

        const response = await httpService.post(
          `/organizationAccount/getAccountDetailByDateRange`,
          accountDetailRequest
        );

        setTotalElements(response.data?.totalElements);
        setTotalPages(response.data?.totalPages);
        setAccountDetailList(response.data?.content);
        setLoading(false);
      }
    } catch (err) {
      notifyError(err.message, err.data, 4000);
      setLoading(false);
    }
  };

  const handleDateRangeChange = (update) => {
    setDateRange(update);
    if (update[0] != null && update[1] != null) {
      let startingDate = update[0]?.toLocaleDateString().split("/");
      startingDate =
        startingDate[1] + "-" + startingDate[0] + "-" + startingDate[2];
      let endingDate = update[1]?.toLocaleDateString().split("/");
      endingDate = endingDate[1] + "-" + endingDate[0] + "-" + endingDate[2];
      setAccountDetailRequest({
        ...accountDetailRequest,
        startDate: startingDate,
        endDate: endingDate,
      });
    } else if (update[0] == null && update[1] == null) {
      setAccountDetailRequest({
        ...accountDetailRequest,
        startDate: null,
        endDate: null,
      });
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    console.log("use effect working...");

    fetchOrgAccountDetails(fileteredId);
  }, [fileteredId, accountDetailRequest]);

  const fetchAccounts = async () => {
    try {
      const sidebarData =
        JSON.parse(localStorage.getItem("organization")) || null;
      if (sidebarData) {
        const response = await httpService.get(
          `/organizationAccount/getAccountByOrgId/${sidebarData.organizationId}`
        );
        setAccounts(response.data || []);
      }
    } catch (err) {
      if (!cId) notifyError(err.message, err.data, 4000);
    }
  };

  const changeSelectedAccount = (account) => {
    setFileteredId(account);
  };

  const tableColumns = [
    { header: "Account", field: "accountName" },
    {
      header: "Type",
      field: "transactionType",
      render: (value) => {
        const baseClass = "font-semibold uppercase";
        if (value === "CREDIT")
          return (
            <span className="text-green-600">
              <i className="fas fa-arrow-up text-emerald-500 mr-1"></i>
              {value}
            </span>
          );
        if (value === "DEBIT")
          return (
            <span className="text-red-600">
              <i className="fas fa-arrow-down text-red-500 mr-1"></i>
              {value}
            </span>
          );
        else
          return (
            <span>
              <i className="fas fa-arrow-up text-emerald-500 mr-4"></i>
              <i className="fas fa-arrow-down text-red-500 mr-4"></i>
              {value}
            </span>
          );
      },
    },
    { header: "Amount", field: "amount" },
    { header: "Comments", field: "comments" },
    { header: "Project", field: "projectName" },
    { header: "Customer", field: "customerName" },
    { header: "Unit", field: "unitSerialNo" },
    { header: "Created Date", field: "createdDate" },
  ];

  const toggleModal = () => {
    setBackdrop(!backdrop);
    setIsModalOpen(!isModalOpen);
  };
  const toggleModalAccount = () => {
    setBackdrop(!backdrop);
    setIsModalOpenAccount(!isModalOpenAccount);
  };

  const handleDetailModal = (data) => {
    const formattedAccountInfo = {
      "Transaction Info": {
        "Account Name": data?.accountName,
        "Transaction Type": data?.transactionType,
        Amount: data?.amount,
        Comments: data?.comments,
        "Project Name": data?.projectName,
        "Customer Name": data?.customerName,
        "Unit Serial No": data?.unitSerialNo,
      },
      "Audit Info": {
        "Created By": data?.createdBy,
        "Updated By": data?.updatedBy,
        "Created Date": data?.createdDate,
        "Updated Date": data?.updatedDate,
      },
    };

    setSelectedCustomerAccount(formattedAccountInfo);
    toggleModalAccount();
  };

  return (
    <>
      <DynamicDetailsModal
        isOpen={isModalOpenAccount}
        onClose={toggleModalAccount}
        data={selectedCustomerAccount}
        title="Account Details"
      />
      <div className="container mx-auto p-4">
        <div className="w-full sm:mb-0">
          <div className="flex flex-wrap py-3 md:justify-content-between">
            <div className=" bg-white shadow-lg p-5 rounded-12 lg:w-4/12 md:w-6/12 sm:w-12/12">
              <label className="block text-sm font-medium mb-1 ">
                Select Account
              </label>
              <select
                value={fileteredId}
                onChange={(e) => changeSelectedAccount(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full"
              >
                <option value="">All Accounts</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} - {account.bankName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <DynamicTableComponentDateRange
          fetchDataFunction={fetchOrgAccountDetails}
          setPage={setPage}
          page={page}
          data={accountDetailList}
          columns={tableColumns}
          pageSize={pageSize}
          totalPages={totalPages}
          totalElements={totalElements}
          loading={loading}
          title="Transaction Summary"
          actions={[
            {
              icon: FaEye,
              onClick: handleDetailModal,
              title: "View Details",
              className: "text-green-600",
            },
          ]}
          onChangeDate={handleDateRangeChange}
          startDate={startDate}
          endDate={endDate}
          changeTransactionType={null}
          selectTransactionType={null}
        />
      </div>
    </>
  );
}
