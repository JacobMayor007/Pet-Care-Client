"use client";

import ClientNavbar from "@/app/ClientNavbar/page";
import { db } from "@/app/firebase/config";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Memorial {
  id?: string;
  morticial_memorial_services?: [];
  mortician_contact?: string;
  mortician_email?: string;
  mortician_fullname?: string;
  mortician_memorial_address?: string;
  mortician_memorial_name?: string;
  mortician_memorial_payments?: [];
  mortician_uid?: string;
}

export default function MemorialProviders() {
  const [memorial, setMemorial] = useState<Memorial[]>([]);

  useEffect(() => {
    const getMemorialProviders = async () => {
      try {
        const memorialRef = collection(db, "memorial");
        const docSnap = await getDocs(memorialRef);

        const result = docSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setMemorial(result);
      } catch (error) {
        console.error(error);
        return [];
      }
    };

    getMemorialProviders();
  }, []);
  return (
    <div>
      <nav className="relative z-20">
        <ClientNavbar />
      </nav>
      <h1 className="mx-52 font-montserrat font-bold text-2xl mt-8">
        Our Memorial Providers
      </h1>

      <div className="mx-52 grid grid-cols-3 gap-6 mt-28 justify-between">
        {memorial.map((data, index) => {
          return (
            <div
              key={index}
              className=" h-[550px] bg-[#006B95] flex flex-col justify-between rounded-xl items-center drop-shadow-md border-[1px] relative border-slate-300 "
            >
              <div className="h-40  w-40 rounded-full border-[1px] border-slate-300 absolute left-[102px] -top-20 bg-white flex items-center justify-center">
                <h1 className="font-montserrat font-bold text-lg capitalize">
                  {data?.mortician_fullname?.charAt(0)}
                </h1>
              </div>
              <div className="mt-32 flex flex-col gap-4 text-white font-montserrat px-6">
                <h1 className="text-center font-montserrat font-bold text-white text-xl capitalize">
                  {data?.mortician_fullname}
                </h1>
                <h1 className="text-center">+63 {data?.mortician_contact}</h1>
                <div className="grid grid-cols-2 text-center items-center">
                  <h1 className="font-semibold">
                    {data?.mortician_memorial_name}
                  </h1>
                  <h1 className="font-semibold">
                    {data?.mortician_memorial_address}
                  </h1>
                </div>
                <div className="flex justify-center gap-4">
                  {data?.morticial_memorial_services?.map((data, index) => {
                    return (
                      <h1
                        key={index}
                        className="font-montserrat font-bold text-white capitalize mt-4  text-xl"
                      >
                        {data}
                      </h1>
                    );
                  })}
                </div>
                <div className="grid grid-cols-3 text-center">
                  {data?.mortician_memorial_payments?.map((data, index) => {
                    return (
                      <h1
                        key={index}
                        className="font-montserrat font-bold text-white capitalize "
                      >
                        {data}
                      </h1>
                    );
                  })}
                </div>
              </div>

              <Link
                href={`/Profile/Memorial/${data?.id}`}
                className="bg-white text-[#006B95] font-bold font-montserrat mb-5 w-fit px-6 py-3 text-lg rounded-lg active:scale-95"
              >
                View Memorial Provider
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
