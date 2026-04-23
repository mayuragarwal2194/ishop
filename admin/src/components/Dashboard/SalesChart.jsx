import React from "react";

const SalesChart = () => {
  return (
    <div className="bg-(--card)p-6 rounded-2xl shadow-sm p-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-(--text)">
          Sales Details
        </h2>

        <select className="bg-(--bg) text-(--text) px-3 py-1 rounded-lg text-sm">
          <option>October</option>
        </select>
      </div>

      {/* CHART PLACEHOLDER */}
      <div className="h-80 flex items-center justify-center text-(--subText)">
        Chart coming next step 📈
      </div>

    </div>
  );
};

export default SalesChart;