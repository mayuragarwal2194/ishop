import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Navbar from "../components/Navbar/Navbar";
import { ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";

const MainLayout = () => {
  const [toastTheme, setToastTheme] = useState("dark");

  useEffect(() => {
    const updateTheme = () => {
      const isLight = document.body.classList.contains("light");
      setToastTheme(isLight ? "light" : "dark");
    };

    updateTheme(); // run on load

    // listen when ThemeToggle changes localStorage
    window.addEventListener("storage", updateTheme);

    // small hack: also update when user clicks toggle in same tab
    const interval = setInterval(updateTheme, 300);

    return () => {
      window.removeEventListener("storage", updateTheme);
      clearInterval(interval);
    };
  }, []);
  return (
    <div className="flex bg-(--bg) min-h-screen">
      <Sidebar />

      <div className="flex-1">
        <Navbar />
        <div className="p-6 md:p-8">
          <Outlet />
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme={toastTheme}
      />
    </div>
  );
};

export default MainLayout;
