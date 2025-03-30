"use client";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import fetchRoom from "../fetchData/fetchRoom";
import { useEffect, useState } from "react";
import ClientNavbar from "../ClientNavbar/page";
import { Carousel, Modal } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import "@ant-design/v5-patch-for-react-19";
import { TimePicker } from "antd";
import { DatePicker } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSortDown } from "@fortawesome/free-solid-svg-icons";
import { Dayjs } from "dayjs";
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
  const [select, setSelect] = useState(false);
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
  const [guests, setGuests] = useState<string | number>(0);

  const options = [
    {
      key: 1,
      number: 1,
      label: "Pets",
    },
    {
      key: 2,
      number: 2,
      label: "Pets",
    },
    {
      key: 3,
      number: 3,
      label: "Pets",
    },
    {
      key: 4,
      number: 4,
      label: "Pets",
    },
    {
      key: 5,
      number: 5,

      label: "Pets",
    },
    {
      key: 6,
      number: 6,
      label: "Pets",
    },
  ];

  const [checkInDate, setCheckInDate] = useState<Dayjs | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Dayjs | null>(null);
  const [checkInTime, setCheckInTime] = useState<Dayjs | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<Dayjs | null>(null);

  const checkInChange = (date: Dayjs | null) => {
    setCheckInDate(date);
  };

  const checkOutChange = (date: Dayjs | null) => {
    setCheckOutDate(date);
  };

  const checkInTimeChange = (time: Dayjs | null) => {
    setCheckInTime(time);
  };

  const checkOutTimeChange = (time: Dayjs | null) => {
    setCheckOutTime(time);
  };

  const calculateDays = (
    checkIn: Dayjs | null,
    checkOut: Dayjs | null
  ): number => {
    if (!checkIn || !checkOut) return 0;
    return checkOut.diff(checkIn, "day");
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("Check In Date", JSON.stringify(checkInDate));
      localStorage.setItem("Check Out Date", JSON.stringify(checkOutDate));
      localStorage.setItem("Check In Time", JSON.stringify(checkInTime));
      localStorage.setItem("Check Out Time", JSON.stringify(checkOutTime));

      // Make sure guests is a number before saving
      localStorage.setItem("Guest", guests.toString() || "");

      // Calculate and store the number of days
      const countedDays = calculateDays(checkInDate, checkOutDate);
      localStorage.setItem("Days", countedDays.toString());
    }
  }, [checkInDate, checkOutDate, checkInTime, checkOutTime, guests]);

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
        <div className="h-16 flex flex-row w-full justify-around my-8">
          <div className="relative h-full">
            <div className="w-60 h-full rounded-full border-[1px] border-[#9BADB4] flex items-center justify-around relative">
              <Image
                src="/PawPrint.svg"
                height={42}
                width={35}
                alt="Paw Print icon"
              />
              <div className="flex flex-col">
                <h1 className="font-montserrat text-base font-bold">Guests</h1>
                <p className="font-montserrat text-base">
                  {guests} Pet{"(s)"}
                </p>
              </div>
              <FontAwesomeIcon
                icon={faSortDown}
                onClick={() => setSelect((prev) => !prev)}
                className="cursor-pointer"
              />
            </div>
            <div
              className={
                select
                  ? `absolute bg-white drop-shadow-lg flex flex-col gap-2 justify-center py-2 rounded-xl`
                  : `hidden`
              }
            >
              {options.map((data) => {
                return (
                  <div
                    key={data?.key}
                    className="w-48 hover:drop-shadow-xl hover:bg-gray-100 px-6 py-2 cursor-pointer flex flex-col justify-center"
                    onClick={() => {
                      setGuests(
                        data?.number === 6 ? `More than 5` : data?.number
                      );
                      setSelect((prev) => !prev);
                    }}
                  >
                    <div className="flex flex-row gap-1 items-center ">
                      <p className="font-montserrat font-medium text-base text-[#262626]">
                        {data?.number === 6
                          ? `More than ${data?.number - 1}`
                          : data?.number}
                      </p>
                      <p className="font-montserrat font-medium text-base text-[#262626]">
                        {data?.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="h-full flex items-center">
            <div className="rounded-full h-16 flex gap-2 items-center w-full px-8 border-[1px] border-[#9BADB4]">
              <Image
                src="/PawPrint.svg"
                height={42}
                width={35}
                alt="Paw Print icon"
              />
              <div className="grid  grid-cols-2 ">
                <div className="col-span-2">
                  <h1 className="font-montserrat font-medium text-base">
                    Check In
                  </h1>{" "}
                </div>
                <DatePicker
                  onChange={checkInChange}
                  className="border-none outline-none drop-shadow-none"
                  needConfirm
                />
                <TimePicker
                  use12Hours
                  format="h:mm a"
                  onChange={checkInTimeChange}
                  className="border-none outline-none drop-shadow-none"
                />
              </div>
            </div>
          </div>
          <div className="h-full flex items-center ">
            <div className="rounded-full h-16 flex gap-10 items-center w-full px-8 border-[1px] border-[#9BADB4]">
              <Image
                src="/PawPrint.svg"
                height={42}
                width={35}
                alt="Paw Print icon"
              />
              <div className="grid grid-cols-2 ">
                <div className="col-span-2">
                  <h1 className="font-montserrat font-medium text-base">
                    Check-Out
                  </h1>
                </div>

                <DatePicker
                  onChange={checkOutChange}
                  needConfirm
                  className="border-none outline-none drop-shadow-none"
                />
                <TimePicker
                  use12Hours
                  format="h:mm a"
                  onChange={checkOutTimeChange}
                  className="border-none outline-none drop-shadow-none"
                />
              </div>
            </div>
          </div>
        </div>
        {!guests ||
        !checkInDate ||
        !checkInTime ||
        !checkOutDate ||
        !checkOutTime ? (
          <div></div>
        ) : (
          <div>
            {room.map((data) => (
              <div
                key={data?.id}
                className="h-full grid grid-cols-8 gap-10 p-4 "
              >
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
                    <Link
                      href={`/Booking/${data?.id}`}
                      className="text-white italic underline font-montserrat text-base"
                    >
                      View Room Details
                    </Link>
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
                        <div>
                          <h1 className="font-montserrat text-white font-bold text-2xl">
                            Php {data?.Renter_RoomPrice}
                          </h1>
                          <p className="font-montserrat text-white text-lg">
                            Per night / day
                          </p>
                          <p className="font-montserrat text-white text-base">
                            Excluding taxes, and fees
                          </p>
                          <button
                            type="button"
                            onClick={() => setBookNow(true)}
                            className={`w-full h-10 font-montserrat text-base rounded-3xl uppercase mt-5 ${
                              data?.Renter_RoomStatus === "occupied" ||
                              data?.Renter_RoomStatus === "reserved"
                                ? `bg-slate-100 text-black font-bold`
                                : `bg-[#77D8DD]  text-white font-bold`
                            }`}
                            disabled={
                              data?.Renter_RoomStatus === "occupied" ||
                              data?.Renter_RoomStatus === "reserved"
                                ? true
                                : false
                            }
                          >
                            {data?.Renter_RoomStatus === "occupied" ||
                            data?.Renter_RoomStatus === "reserved"
                              ? data?.Renter_RoomStatus
                              : `Book Now`}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
