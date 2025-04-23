"use client";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import fetchRoom from "../fetchData/fetchRoom";
import { useEffect, useState } from "react";
import ClientNavbar from "../ClientNavbar/page";
import { Carousel, Modal } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import "@ant-design/v5-patch-for-react-19";
import Link from "next/link";

interface Room {
  id?: string;
  Renter_CreatedAt?: string;
  Renter_Location?: string;
  Renter_PaymentMethod?: string;
  Renter_RoomDescription?: string;
  Renter_RoomFeatures?: string;
  Renter_RoomName?: string;
  Renter_RoomPrice?: number;
  Renter_RoomStatus?: string;
  Renter_TotalPrice?: number;
  Renter_TypeOfRoom?: string;
  Renter_UserFullName?: string;
  Renter_UserID?: string;
}

export default function Booking() {
  const [room, setRoom] = useState<Room[]>([]);
  const [bookNow, setBookNow] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/Login");
      }
    });

    return () => unsubscribe();
  });

  useEffect(() => {
    const fetchRooms = async () => {
      const fetchedRooms = await fetchRoom();
      setRoom(fetchedRooms);
    };
    fetchRooms();
  }, []);

  return (
    <div className="h-full">
      <nav className="z-10 relative">
        <ClientNavbar />
      </nav>
      <Carousel dots={false} className="z-0">
        <div className="bg-[#77D8DD] h-48 bg-cover ">
          <div className="flex flex-row justify-between items-end">
            <div className="flex flex-col gap-1 ml-10 mb-1">
              <h1 className="font-sigmar text-5xl text-white font-bold mb-2">
                Pet Care
              </h1>
              <p className="text-2xl font-montserrat font-normal text-white">
                Location, location, location
              </p>
              <p className="text-2xl font-montserrat font-normal text-white">
                +63 999 9999
              </p>
            </div>

            <Image
              src="/Cat.svg"
              height={100}
              width={100}
              alt="Cat Picture"
              className="object-contain h-48 w-36"
            />
          </div>
        </div>
      </Carousel>
      <div className="pt-10 mx-10">
        <h1 className="font-montserrat text-5xl font-bold">Booking</h1>
        <p className="font-montserrat text-base">
          Choose from our selection of quality rooms made for your wonderful
          pets.{" "}
        </p>
        <p className="italic font-montserrat text-xs">Rates may apply*</p>

        <div>
          {room.map((data) => (
            <div key={data?.id} className="h-full grid grid-cols-8 gap-10 p-4 ">
              <div className="col-span-2 pt-32 pl-16">
                <h1 className="font-hind text-base italic text-gray-400">
                  Image of {data?.Renter_RoomName}
                </h1>
              </div>
              <div className="col-span-6 bg-[#86B2B4] py-8 px-14 rounded-3xl">
                <div className="flex flex-col gap-3">
                  <h1 className="font-montserrat text-xs text-gray-100 font-bold">
                    Room Name / Number: {data.Renter_RoomName}
                  </h1>
                  <h1 className="font-montserrat text-3xl text-white font-bold ">
                    {data?.Renter_TypeOfRoom}
                  </h1>
                  <p className="font-montserrat text-base leading-7 font-medium text-white">
                    {data?.Renter_RoomDescription
                      ? data.Renter_RoomDescription.split(".")[0] + "."
                      : ""}
                  </p>

                  <div className="border-b-2 border-gray-300 mb-4" />
                  <div className="grid grid-cols-7">
                    <div className="col-span-2">
                      <h1 className="font-montserrat text-xl text-white font-bold">
                        Features:
                      </h1>
                      {room.map((data) => {
                        const features = data?.Renter_RoomFeatures
                          ? JSON.parse(data.Renter_RoomFeatures)
                          : [];
                        return (
                          <ul key={data?.id} className="">
                            {Array.isArray(features) &&
                              features.map(
                                (feature: {
                                  id: string;
                                  name: string;
                                  price: string;
                                }) => (
                                  <li
                                    key={feature.id}
                                    className="font-montserrat text-white text-base font-medium "
                                  >
                                    {feature.name} - Php {feature.price}
                                  </li>
                                )
                              )}{" "}
                          </ul>
                        );
                      })}
                    </div>
                    <div className="col-span-5 flex justify-end">
                      <div className="h-fit flex flex-col">
                        <h1 className="font-montserrat text-white font-bold text-2xl">
                          Php {data?.Renter_RoomPrice}
                        </h1>
                        <p className="font-montserrat text-white text-lg">
                          Per night / day
                        </p>
                        <p className="font-montserrat text-white text-base">
                          Excluding taxes, and fees
                        </p>

                        <Link
                          href={`/Booking/${data?.id}`}
                          className={`w-full h-10 flex flex-col justify-center items-center font-montserrat text-base rounded-3xl uppercase mt-5 ${
                            data?.Renter_RoomStatus === "occupied" ||
                            data?.Renter_RoomStatus === "reserved"
                              ? `bg-slate-100 text-black font-bold`
                              : `bg-[#77D8DD]  text-white font-bold`
                          }`}
                        >
                          {data?.Renter_RoomStatus === "occupied" ||
                          data?.Renter_RoomStatus === "reserved"
                            ? data?.Renter_RoomStatus
                            : `Book Now`}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Modal
        open={bookNow}
        centered
        onCancel={() => setBookNow(false)}
        onClose={() => setBookNow(false)}
      ></Modal>
    </div>
  );
}
