import React from "react";

const cards = [
  {
    title: "Total User",
    value: "40,689",
    change: "+8.5%",
    note: "Up from yesterday",
    icon: "ri-user-3-line",
    color: "#8B5CF6",
    bg: "#F3E8FF"
  },
  {
    title: "Total Order",
    value: "10293",
    change: "+1.3%",
    note: "Up from past week",
    icon: "ri-box-3-line",
    color: "#F59E0B",
    bg: "#FEF3C7"
  },
  {
    title: "Total Sales",
    value: "$89,000",
    change: "-4.3%",
    note: "Down from yesterday",
    icon: "ri-line-chart-line",
    color: "#10B981",
    bg: "#DCFCE7"
  },
  {
    title: "Total Pending",
    value: "2040",
    change: "+1.8%",
    note: "Up from yesterday",
    icon: "ri-time-line",
    color: "#EF4444",
    bg: "#FEE2E2"
  }
];

const StatsCards = () => {
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-(--card) p-5 rounded-2xl shadow-sm"
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-(--subText)">
              {card.title}
            </span>

            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: card.bg, color: card.color }}
            >
              <i className={`${card.icon} text-lg`}></i>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-(--text)">
            {card.value}
          </h2>

          <p className="text-sm mt-2 text-(--subText)">
            <span
              className={
                card.change.includes("-")
                  ? "text-red-500"
                  : "text-emerald-500"
              }
            >
              {card.change}
            </span>{" "}
            {card.note}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;