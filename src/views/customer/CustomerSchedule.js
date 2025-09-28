import PaymentSchedule from "components/PaymentSchedule/PaymentSchedule";
import { MainContext } from "context/MainContext";
import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import httpService from "utility/httpService";

const CustomerSchedule = () => {
  const { setLoading } = useContext(MainContext);
  const [filterProject, setFilterProject] = useState("");
  const [projects, setProjects] = useState([]);
  const [selectedCustomerAccount, setSelectedCustomerAccount] = useState(null);
  const [customerAccountList, setCustomerAccountList] = useState([]);
  const [customerName, setCustomerName] = useState("");

  const { customerAccountId } = useParams();

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

  const changeCustomerAccount = (accountId) => {
    if (accountId) {
      setSelectedCustomerAccount(accountId);
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

  const changeSelectedProjected = (projectId) => {
    if (projectId) {
      setFilterProject(projectId);
      fetchCustomerAccountList(projectId, "project");
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

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-wrap">
        <div className=" bg-white shadow-lg p-5 rounded-12 lg:w-4/12 md:w-6/12 sm:w-12/12">
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
        <div className="bg-white shadow-lg p-5 mx-4 rounded-12 lg:w-4/12 md:w-6/12 sm:w-12/12 md:mx-0 sm:mt-5">
          <label className="block text-sm font-medium mb-1">
            Customer Account
          </label>
          <select
            value={selectedCustomerAccount}
            onChange={(e) => changeCustomerAccount(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="">Select Account</option>
            {customerAccountList.map((account) => (
              <option key={account.accountId} value={account.accountId}>
                {account.customerName} - {account.unitSerial}
              </option>
            ))}
          </select>
        </div>
        <div
          id="payment-schedule-print"
          className="w-full bg-white shadow-lg p-5 rounded-12 lg:w-12/12 mt-5"
        >
          <PaymentSchedule
            accountId={
              selectedCustomerAccount
                ? selectedCustomerAccount
                : customerAccountId
            }
          />
        </div>
      </div>
    </div>
  );
};

export default CustomerSchedule;
