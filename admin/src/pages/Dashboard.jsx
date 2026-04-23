import React from "react";
import StatsCards from "../components/Dashboard/StatsCards";
import SalesChart from "../components/Dashboard/SalesChart";
import DealsTable from "../components/Dashboard/DealsTable";

const Dashboard = () => {
  return (
    <div className="bg-(--bg) min-h-screen">
      
      {/* PAGE TITLE */}
      <h1 className="text-2xl font-semibold text-(--text) mb-6">
        Dashboard
      </h1>

      {/* STATS CARDS */}
      <StatsCards />

      {/* CHART */}
      <div className="mt-6">
        <SalesChart />
      </div>

      {/* DEALS TABLE */}
      <div className="mt-6">
        <DealsTable />
      </div>

    </div>
  );
};

export default Dashboard;