import Image from "next/image";
import React from "react";

export default function Navbar() {
  return (
    <div className="bg-white w-full">
      <div className="container mx-auto py-4">
        <div className="row flex items-center justify-between">
          <div className="flex items-center gap-20">
            <Image
              src="/logo.png"
              width={150}
              height={49}
              alt="logo"
              loading="eager"
            />
            <ul className="nav-menu flex items-center gap-7 fs-14 font-medium">
              <li>
                Home
                <i className="ri-arrow-down-s-line"></i>
              </li>
              <li>
                Pages
                <i className="ri-arrow-down-s-line"></i>
              </li>
              <li>
                Products
                <i className="ri-arrow-down-s-line"></i>
              </li>
              <li>
                Contact
                <i className="ri-arrow-down-s-line"></i>
              </li>
            </ul>
          </div>
          <div className="flex items-center gap-7">
            <div>
              <span className="fs-12-400 text-muted">WELCOME</span>
              <div className="uppercase fs-14 font-medium">
                Log in / Register
              </div>
            </div>
            <div className="flex items-center gap-5 mt-2">
              <div className="cart-icon circle-gray w-10 h-10 rounded-full bg-grays relative flex items-center justify-center">
                <i className="ri-shopping-bag-line"></i>
                <div className="cart-items-count bg-green w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center absolute -bottom-1 -right-1">
                  5
                </div>
              </div>
              <div>
                <span className="fs-12-400 text-muted">CART</span>
                <div className="uppercase fs-14 font-medium">$1,689.00</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
