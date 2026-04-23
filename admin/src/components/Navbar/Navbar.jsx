import React from "react";
import ThemeToggle from "../ThemeToggle/ThemeToggle";

const Navbar = () => {
  return (
    <div className="w-full flex items-center justify-between px-4 md:px-6 py-3 bg-(--card)">
      {/* SEARCH BAR */}
      <div className="hidden md:flex items-center bg-(--bg) px-3 py-2 rounded-lg w-55 lg:w-70">
        <i className="ri-search-line text-(--subText) text-lg"></i>
        <input
          type="text"
          placeholder="Search"
          className="bg-transparent outline-none text-(--text) placeholder:text-(--subText) ml-2 w-full text-sm"
        />
      </div>

      <div className="flex items-center gap-10">
        <ThemeToggle />
        {/* NOTIFICATION ICON */}
        <div className="relative cursor-pointer">
          <i className="ri-notification-3-line text-(--text) text-xl"></i>

          {/* red dot */}
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-(--danger) rounded-full"></span>
        </div>

        {/* LANGUAGE */}
        <div className="flex items-center gap-2 cursor-pointer">
          <img
            src="/uk.png"
            alt="lang"
            className="w-5 h-5 rounded-full object-cover"
          />
          <span className="hidden sm:block text-(--text) text-sm">English</span>
        </div>

        {/* USER PROFILE */}
        <div className="flex items-center gap-2 cursor-pointer">
          <img
            src="/woman.png"
            alt="user"
            className="w-8 h-8 rounded-full object-cover"
          />
          <div className="hidden md:flex flex-col leading-tight">
            <span className="text-(--text) text-sm font-medium">Moni Roy</span>
            <span className="text-(--subText) text-xs">Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
