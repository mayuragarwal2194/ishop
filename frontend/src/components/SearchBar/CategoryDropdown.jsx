"use client";

import { useState } from "react";

export default function CategoryDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative mr-2">
      <button onClick={() => setOpen(!open)} className="text-sm fs-14 font-medium">
        All Categories
        <i className="ri-arrow-down-s-line"></i>
      </button>

      {open && (
        <div className="absolute top-full left-0 bg-white shadow-md mt-2 rounded-md p-2">
          <div>Electronics</div>
          <div>Clothing</div>
        </div>
      )}
    </div>
  );
}