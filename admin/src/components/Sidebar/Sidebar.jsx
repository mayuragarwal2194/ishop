import React, { useState } from "react";
import { NavLink } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", icon: "ri-home-5-line", path: "/" },
  { name: "Categories", icon: "ri-apps-2-line", path: "/categories" },
  { name: "Products", icon: "ri-box-3-line", path: "/products" },
  { name: "Orders", icon: "ri-shopping-cart-2-line", path: "/orders" },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`h-screen bg-(--sidebar) p-4 flex flex-col justify-between transition-all duration-300
  ${collapsed ? "w-20" : "w-65"}`}
    >
      {/* TOP SECTION */}
      <div>
        {/* LEFT: Title */}
        <div className="flex items-center justify-between mb-10">
          {!collapsed && (
            <h1 className="text-(--text) text-lg md:text-xl font-semibold">
              <span className="text-(--heading)">Dash</span>Board
            </h1>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-(--text) text-xl"
          >
            <i
              className={`${collapsed ? "ri-menu-unfold-line" : "ri-menu-fold-line"} cursor-pointer`}
            ></i>
          </button>
        </div>
        {/* MENU */}
        <div className={`flex flex-col gap-2 ${collapsed && "items-center"}`}>
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-3 rounded-lg transition-all group text-center
        ${
          isActive
            ? "bg-(--sidebarActive) text-white"
            : "text-(--sidebarText) hover:bg-(--bg)"
        }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* ACTIVE LEFT LINE */}
                  {isActive && (
                    <span
                      className={`absolute ${
                        collapsed ? "-left-4.5" : "-left-3.75"
                      } top-2 bottom-2 w-1 bg-(--sidebarActive) rounded-r-md`}
                    ></span>
                  )}

                  {/* ICON */}
                  <i className={`${item.icon} text-lg`}></i>

                  {/* TEXT */}
                  {!collapsed && (
                    <span className="text-sm font-medium">{item.name}</span>
                  )}

                  {/* TOOLTIP */}
                  {collapsed && (
                    <span className="absolute left-full ml-3 px-2 py-1 text-xs bg-(--card) text-(--text) rounded opacity-0 group-hover:opacity-100 whitespace-nowrap shadow">
                      {item.name}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* BOTTOM SECTION (optional like your design later) */}
      {!collapsed && <div className="text-(--subText) text-sm">© 2026</div>}
    </div>
  );
};

export default Sidebar;
