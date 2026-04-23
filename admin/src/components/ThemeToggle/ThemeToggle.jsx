import { useState, useEffect } from "react";
import "./ThemeToggle.css";

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark" : true;
  });

  useEffect(() => {
    if (dark) {
      document.body.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button onClick={() => setDark(!dark)} className="theme-toggle">
      <div className="icon-wrapper group">
        <i
          className={`theme-icon ${
            dark ? "ri-sun-fill text-white" : "ri-moon-fill"
          }`}
        ></i>

        <span
          className="absolute top-[-38%] right-[80%]
          px-2 py-1 text-xs rounded
          opacity-0 group-hover:opacity-100
          whitespace-nowrap shadow pointer-events-none text-(--text)"
        >
          {dark ? "light mode" : "dark mode"}
        </span>
      </div>
    </button>
  );
}