"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Modal } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

export default function RegisterAs() {
  const [signUpAs, setSignUpAs] = useState(false);

  const registerAsData = [
    { key: 0, label: "Pet Owner", route: "/Sign-Up", icon: "faPaw" },
    {
      key: 1,
      label: "Pet Product Seller",
      route: "/Sign-Up/Provider",
      icon: "faHandshakeSimple",
    },
    {
      key: 2,
      label: "Pet Veterinarian",
      route: "/Sign-Up/Doctor",
      icon: "faHandHoldingMedical",
    },
    {
      key: 3,
      label: "Pet Memorial",
      icon: "faDove",
      route: "/Funeral",
    },
    { key: 4, label: "Pet Sitting Services", route: "/Sitter" },
    {
      key: 5,
      label: "Pet Boarding Services",
      route: "/Renters",
    },
  ];
  return (
    <div>
      <div className="relative z-20 border-2 cursor-pointer font-medium font-montserrat border-gray-300 rounded-lg drop-shadow-md w-fit gap-2 text-center h-10 flex items-center ">
        <div
          onClick={() => setSignUpAs((prev) => !prev)}
          className=" w-full gap-2 text-center h-10 flex items-center px-2"
        >
          Register As?
          <FontAwesomeIcon icon={faChevronDown} />
        </div>
      </div>
      <Modal
        open={signUpAs}
        onClose={() => setSignUpAs(false)}
        onCancel={() => setSignUpAs(false)}
      >
        <div>
          {registerAsData.map((data) => (
            <Link
              href={data.route}
              key={data.key}
              className="hover:bg-slate-300 font-hind font-medium px-4 py-1 cursor-pointer text-nowrap text-start block"
            >
              {data.label}
            </Link>
          ))}
        </div>
      </Modal>
    </div>
  );
}
