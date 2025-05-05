import React, { useEffect, useState, useContext } from "react";
import httpService from "../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../components/table/DynamicTableComponent.js";
import {
  useHistory,
  useParams,
  useLocation,
} from "react-router-dom/cjs/react-router-dom.min.js";

export default function CustomerPayment() {
  const { loading, setLoading, notifyError } = useContext(MainContext);
  const history = useHistory();
  const location = useLocation();
  const { customerAccountId } = useParams();

  const [projects, setProjects] = useState([]);
  const [customerAccountFilterId, setCustomerAccountFilterId] = useState(""); // The ID of the selected project or floor
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filteredId, setFilteredId] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAccountList, setCustomerAccountList] = useState([]);
  const [selectedCustomerAccount, setSelectedCustomerAccount] = useState(null);
  const [customerPaymentList, setCustomerPaymentList] = useState([]);
  const pageSize = 10;

  useEffect(() => {
    fetchCustomerPayments();
  }, [selectedCustomerAccount, page]);

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

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const myParam = queryParams.get("cName");
    setCustomerName(myParam);
  }, []);

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
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerPayments = async () => {
    try {
      if (!customerAccountId && !selectedCustomerAccount) {
        return;
      }

      let accountId = selectedCustomerAccount
        ? selectedCustomerAccount
        : customerAccountId;


      setLoading(true);
      const requestBody = {
        id: accountId,
        page,
        size: pageSize,
        sortBy: "id",
        sortDir: "asc",
      };

      const response = await httpService.post(
        "/customerPayment/getByCustomerAccountId",
        requestBody
      );

      setCustomerPaymentList(response?.data?.content || []);
      setTotalPages(response?.data?.totalPages || 0);
      setTotalElements(response?.data?.totalElements || 0);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

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
      notifyError("Failed to load projects", 4000);
    }
  };

  const changeSelectedProjected = (projectId) => {
    if (projectId) {
      setFilteredId(projectId);
      setFilterProject(projectId)
      fetchCustomerAccountList(projectId, "project");
    }
  };

  const changeCustomerAccount = (accountId) => {
    if (accountId) {
      setSelectedCustomerAccount(accountId);
      setCustomerAccountFilterId(accountId);
      let customerName = customerAccountList.find(
        (customer) => customer.accountId == accountId
      );
      setCustomerName(customerName.customerName);
    }
  };

  const tableColumns = [
    { header: "Amount", field: "amount" },
    { header: "Received Amount", field: "receivedAmount" },
    { header: "Payment Type", field: "paymentType" },
    { header: "Customer Account ID", field: "customerAccountId" },
    { header: "Created By", field: "createdBy" },
    { header: "Created Date", field: "createdDate" },
    { header: "Updated By", field: "updatedBy" },
    { header: "Updated Date", field: "updatedDate" },
  ];

  const handleView = (floor) => {
    if (!floor) {
      return notifyError("Invalid Project!", 4000);
    }
    history.push(`/dashboard/unit/${floor.id}`);
  };

  const handleEdit = (floor) => {
    console.log("Edit Floor:", floor);
  };

  const handleDelete = (floor) => {
    console.log("Delete Floor:", floor);
  };

  const actions = {
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
  };

  return (
    <>
      <div className="container mx-auto p-4">
        <div className="relative flex flex-row min-w-0 bg-white w-full mb-6 shadow-lg rounded p-4">
          <div className="flex flex-nowrap gap-4">
            <div className="w-50">
              <label className="block text-sm font-medium mb-1">Project</label>
              <select
                value={filterProject}
                onChange={(e) => changeSelectedProjected(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Customer Account
              </label>
              <select
                value={selectedCustomerAccount}
                onChange={(e) => changeCustomerAccount(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="">Account Filter</option>
                {customerAccountList.map((account) => (
                  <option key={account.accountId} value={account.accountId}>
                    {account.customerName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Table */}
      <div className="container mx-auto p-4">
        <DynamicTableComponent
          fetchDataFunction={fetchCustomerPayments}
          setPage={setPage}
          page={page}
          data={customerPaymentList}
          columns={tableColumns} // You need to define the columns for the table
          pageSize={pageSize}
          totalPages={totalPages}
          totalElements={totalElements}
          loading={loading}
          actions={actions}
          title={customerName ? customerName + " - Payments" : ""}
        />
      </div>
    </>
  );
}
