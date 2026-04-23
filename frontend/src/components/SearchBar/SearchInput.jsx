"use client";

import { useState } from "react";

export default function SearchInput() {
  const [query, setQuery] = useState("");

  return (
    <input
      type="text"
      placeholder="Search anything..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className="flex-1 outline-none px-2 fs-14-normal"
    />
  );
}