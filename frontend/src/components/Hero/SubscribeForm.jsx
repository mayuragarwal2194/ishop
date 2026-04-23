"use client";

import { useState } from "react";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(email);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex items-center w-full max-w-95 h-16 pl-5 pr-1 backdrop-blur-2xl bg-white/10 border border-white/30 rounded-full 
      shadow-[0_10px_40px_rgba(0,0,0,0.25)]`}
    >
      {/* Icon */}
      <div className="text-white/80 text-xl mr-3">
        <i className="ri-send-plane-line"></i>
      </div>

      {/* Input */}
      <input
        type="email"
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={`flex-1 bg-transparent outline-none text-white 
        placeholder:text-white/70 text-sm`}
      />

      {/* Button */}
      <button
        type="submit"
          className="h-13.5 px-7 bg-teal-500 hover:bg-teal-600 text-white rounded-full text-sm font-medium transition-all duration-300 cursor-pointer"
        >
        Subscribe
      </button>
    </form>
  );
}
