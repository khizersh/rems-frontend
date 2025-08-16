import React, { useContext, useEffect, useState } from "react";

// components

import CardStats from "components/Cards/CardStats.js";
import { MainContext } from "context/MainContext";
import httpService from "utility/httpService";

export default function HeaderStats() {

  const { loading, setLoading, notifyError, notifySuccess } =
    useContext(MainContext);

  const dataList = [
    {
      title: "Last 7 days",
      value: 7
    },
    {
      title: "Last 10 days",
      value: 10
    },
    {
      title: "Last 30 days",
      value: 30
    },
    {
      title: "Last 90 days",
      value: 90
    },
    {
      title: "Last 365 days",
      value: 365
    }
  ]

  const [stats, setStats] = useState({
    project: {
      title: "Project",
      value: "36,456",
      percentage: "34",
      tenure: "30 last days",
      onChange: (value) => {
        setStats((prevState) => ({
          ...prevState,
          project: {
            ...prevState.project,
            filterValue: value
          },
        }));
      },
      dataList: dataList,
      filterValue: 7
    },
    user: {
      title: "User",
      tenure: "",
      value: "",
      percentage: "",
      onChange: (value) => {
        setStats((prevState) => ({
          ...prevState,
          user: {
            ...prevState.user,
            filterValue: value
          },
        }));
      },
      dataList: dataList,
      filterValue: 7
    },
    sale: {
      title: "Sales",
      value: "",
      tenure: "",
      percentage: "",
      onChange: (value) => {
        setStats((prevState) => ({
          ...prevState,
          sale: {
            ...prevState.sale,
            filterValue: value
          },
        }));
      },
      dataList: dataList,
      filterValue: 7
    },
    received_payment: {
      title: "Received Payment",
      value: "",
      tenure: "",
      percentage: "",
      onChange: (value) => {
        setStats((prevState) => ({
          ...prevState,
          received_payment: {
            ...prevState.received_payment,
            filterValue: value
          },
        }));
      },
      dataList: dataList,
      filterValue: 7
    },

  })

  useEffect(() => {
    setProjects();
  }, [stats.project.filterValue]);

  useEffect(() => {
    setUsers();
  }, [stats.user.filterValue]);

  useEffect(() => {
    setSales();
  }, [stats.sale.filterValue]);

  useEffect(() => {
    setReceivedPayments();
  }, [stats.received_payment.filterValue]);


  const setProjects = async () => {
    setLoading(true);
    try {
      const request = {
        "orgId": 0,
        "requestBy": "project",
        "tenure": stats.project.filterValue
      }
      const organization = JSON.parse(localStorage.getItem("organization")) || null;
      if (organization) {
        request.orgId = organization.organizationId
      }
      const response = await httpService.post(
        `/analytics/getCount`,
        request
      );

      setStats((prevState) => ({
        ...prevState,
        project: {
          ...prevState.project,
          ...response.data
        }
      }))
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  }


  const setUsers = async () => {
    setLoading(true);
    try {
      const request = {
        orgId: 1,
        requestBy: "user",
        tenure: stats.user.filterValue,
      };
      const organization = JSON.parse(localStorage.getItem("organization")) || null;
      if (organization) {
        request.orgId = organization.organizationId;
      }

      const response = await httpService.post(`/analytics/getCount`, request);

      setStats((prevState) => ({
        ...prevState,
        user: {
          ...prevState.user,
          ...response.data,
        },
      }));
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const setSales = async () => {
    setLoading(true);
    try {
      const request = {
        orgId: 1,
        requestBy: "sale",
        tenure: stats.sale.filterValue,
      };
      const organization = JSON.parse(localStorage.getItem("organization")) || null;
      if (organization) {
        request.orgId = organization.organizationId;
      }

      const response = await httpService.post(`/analytics/getCount`, request);

      setStats((prevState) => ({
        ...prevState,
        sale: {
          ...prevState.sale,
          ...response.data,
        },
      }));
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const setReceivedPayments = async () => {
    setLoading(true);
    try {
      const request = {
        orgId: 1,
        requestBy: "received_payment",
        tenure: stats.received_payment.filterValue,
      };
      const organization = JSON.parse(localStorage.getItem("organization")) || null;
      if (organization) {
        request.orgId = organization.organizationId;
      }

      const response = await httpService.post(`/analytics/getCount`, request);

      setStats((prevState) => ({
        ...prevState,
        received_payment: {
          ...prevState.received_payment,
          ...response.data,
        },
      }));
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="relative header-stats bg-lightBlue-600 md:py-16 sm:py-16 mb-12 w-full px-4 md:rounded-12 lg:rounded-none">
        <div className="px-4 md:px-8 mx-auto w-full">
          <div>
            {/* Card stats */}
            <div className="flex flex-wrap">
              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle={stats.project.title}
                  statTitle={stats.project.value}
                  statArrow={stats.project.percentage > 0 ? "up" : "down"}
                  statPercent={stats.project.percentage}
                  statPercentColor="text-emerald-500"
                  statDescripiron={stats.project.tenure}
                  dataList={stats.project.dataList}
                  onChange={stats.project.onChange}
                  filterValue={stats.project.filterValue}
                  statIconName="far fa-chart-bar"
                  statIconColor="bg-red-500"
                />
              </div>

              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle={stats.user.title}
                  statTitle={stats.user.value}
                  statArrow={stats.user.percentage > 0 ? "up" : "down"}
                  statPercent={stats.user.percentage}
                  statPercentColor="text-emerald-500"
                  statDescripiron={stats.user.tenure}
                  dataList={stats.user.dataList}
                  onChange={stats.user.onChange}
                  filterValue={stats.user.filterValue}
                  statIconName="fas fa-chart-pie"
                  statIconColor="bg-orange-500"
                />
              </div>

              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle={stats.sale.title}
                  statTitle={stats.sale.value}
                  statArrow={stats.sale.percentage > 0 ? "up" : "down"}
                  statPercent={stats.sale.percentage}
                  statPercentColor="text-emerald-500"
                  statDescripiron={stats.sale.tenure}
                  dataList={stats.sale.dataList}
                  onChange={stats.sale.onChange}
                  filterValue={stats.sale.filterValue}
                  statIconName="fas fa-users"
                  statIconColor="bg-pink-500"
                />
              </div>

              <div className="w-full lg:w-6/12 xl:w-3/12 px-4">
                <CardStats
                  statSubtitle={stats.received_payment.title}
                  statTitle={stats.received_payment.value}
                  statArrow={stats.received_payment.percentage > 0 ? "up" : "down"}
                  statPercent={stats.received_payment.percentage}
                  statPercentColor="text-emerald-500"
                  statDescripiron={stats.received_payment.tenure}
                  dataList={stats.received_payment.dataList}
                  onChange={stats.received_payment.onChange}
                  filterValue={stats.received_payment.filterValue}
                  statIconName="fas fa-percent"
                  statIconColor="bg-lightBlue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
