import React from "react";

const DealsTable = () => {
  return (
    <div className="bg-(--card) p-6 rounded-2xl shadow-sm">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-(--text)">
          Deals Details
        </h2>

        <select className="bg-(--bg)text-(--text) px-3 py-1 rounded-lg text-sm">
          <option>October</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-(--bg) text-(--subText)">
            <tr>
              <th className="p-3 text-left">Product Name</th>
              <th className="p-3 text-left">Location</th>
              <th className="p-3 text-left">Date - Time</th>
              <th className="p-3 text-left">Piece</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            <tr className="border-t border-(--border)">
              <td className="p-3">Apple Watch</td>
              <td className="p-3">6096 Marjolaine Landing</td>
              <td className="p-3">12.09.2026 - 12:53 PM</td>
              <td className="p-3">423</td>
              <td className="p-3">$34,295</td>
              <td className="p-3">
                <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-xs">
                  Delivered
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DealsTable;