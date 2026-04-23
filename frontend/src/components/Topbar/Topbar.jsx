import React from "react";

export default function Topbar() {
  return (
    <div className="bg-white w-full">
      <div className="container mx-auto py-4">
        <div className="row flex items-center justify-between">
          <div className="flex items-center gap-7">
            <span className="bg-grays rounded-xl text-[12px] p-[6px_28px]">
              Hotline 24/7
            </span>
            <div className="top-contact text-[12px] font-semibold">
              (025) 3886 25 16
            </div>
          </div>
          <div className="flex items-center gap-7 fs-14-normal">
            <div>Sell on Swoo</div>
            <div>Order Tracking</div>
            <div>
              USD
              <i className="ri-arrow-down-s-line"></i>
            </div>
            <div className="flex items-center gap-2">
              <img
                src="united-states.png"
                width={15}
                height={15}
                alt="united states flag image"
              />
              Eng
              <i className="ri-arrow-down-s-line"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
