"use client";
import { useEffect, useState } from "react";
import fetchProduct, {
  fetchFoodProduct,
  fetchItemProduct,
} from "./fetchData/fetchProduct";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileShield } from "@fortawesome/free-solid-svg-icons";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import ClientNavbar from "./ClientNavbar/page";
import Image from "next/image";
import fetchRoom from "./fetchData/fetchRoom";
import fetchDoctor from "./fetchData/fetchDoctor";
import Link from "next/link";

interface Product {
  id: string;
  Seller_PaymentMethod?: string;
  Seller_TotalPrice?: string;
  Seller_ProductName?: string;
  Seller_ProductDescription?: string;
  Seller_ProductPrice?: string;
  Seller_UserID?: string;
  Seller_ProductFeatures?: string;
  Seller_UserFullName?: string;
}

interface Food {
  id: string;
  Seller_PaymentMethod?: string;
  Seller_TotalPrice?: string;
  Seller_ProductName?: string;
  Seller_ProductDescription?: string;
  Seller_ProductPrice?: string;
  Seller_UserID?: string;
  Seller_ProductFeatures?: string;
  Seller_UserFullName?: string;
}

interface Item {
  id: string;
  Seller_PaymentMethod?: string;
  Seller_TotalPrice?: string;
  Seller_ProductName?: string;
  Seller_ProductDescription?: string;
  Seller_ProductPrice?: string;
  Seller_UserID?: string;
  Seller_ProductFeatures?: string;
  Seller_UserFullName?: string;
}

interface Room {
  id?: string;
  Renter_CreatedAt?: string;
  Renter_Location?: string;
  Renter_PaymentMethod?: string;
  Renter_RoomDescription?: string;
  Renter_RoomFeatures?: string;
  Renter_RoomName?: string;
  Renter_RoomPrice?: number;
  Renter_TotalPrice?: number;
  Renter_TypeOfRoom?: string;
  Renter_UserFullName?: string;
  Renter_UserID?: string;
}

interface Doctor {
  id?: string;
  User_Email?: string;
  User_Name?: string;
  User_UID?: string;
  User_UserType?: string;
  User_PNumber?: string;
  User_TypeOfAppointment?: [string];
  User_AvailableHours?: {
    Days?: [number];
  };
}
export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [userID, setUserID] = useState("");
  const [room, setRoom] = useState<Room[]>([]);
  const [productID, setProductID] = useState("");
  const [roomID, setRoomID] = useState("");
  const [item, setItem] = useState<Item[]>([]);
  const [food, setFood] = useState<Food[]>([]);
  const [doctor, setDoctor] = useState<Doctor[]>([]);
  const [doctorID, setDoctorID] = useState("");

  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserID(user.uid);
      } else {
        router.push("/Login");
      }
    });

    return () => unsubscribe();
  });

  useEffect(() => {
    const getProducts = async () => {
      const fetchedProducts = await fetchProduct();
      setProducts(fetchedProducts);
    };

    getProducts();
  }, []);

  useEffect(() => {
    const getFood = async () => {
      const fetchedFood = await fetchFoodProduct();
      setFood(fetchedFood);
    };

    getFood();
  }, []);

  useEffect(() => {
    const getItem = async () => {
      const fetchItems = await fetchItemProduct();
      setItem(fetchItems);
    };

    getItem();
  }, []);

  useEffect(() => {
    const getRooms = async () => {
      const fetchedRooms = await fetchRoom();
      setRoom(fetchedRooms);
    };
    getRooms();
  });

  const weeks = [
    {
      key: 0,
      label: "Sunday",
    },
    {
      key: 1,
      label: "Monday",
    },
    {
      key: 2,
      label: "Tuesday",
    },
    {
      key: 3,
      label: "Wednesday",
    },
    {
      key: 4,
      label: "Thursday",
    },
    {
      key: 5,
      label: "Friday",
    },
    {
      key: 6,
      label: "Saturday",
    },
  ];

  useEffect(() => {
    const getDoctors = async () => {
      const fetchedDoctors = await fetchDoctor();
      setDoctor(fetchedDoctors);
    };
    getDoctors();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedProductID = localStorage.getItem("Product ID");
      const storedRoomID = localStorage.getItem("Room ID");
      const storedDoctorID = localStorage.getItem("Doctor ID");

      if (storedProductID) setProductID(storedProductID);
      if (storedRoomID) setRoomID(storedRoomID);
      if (storedDoctorID) setDoctorID(storedDoctorID);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("Product ID", productID);
      localStorage.setItem("Room ID", roomID);
      localStorage.setItem("Doctor ID", doctorID);
    }
  }, [productID, roomID, doctorID]);

  return (
    <div className={userID ? `block` : `hidden`}>
      <nav className="z-10 relative">
        <ClientNavbar />
      </nav>
      <div
        className=" h-60 flex flex-row justify-between"
        style={{
          backgroundImage: "url('/Frame 15.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex items-center justify-center pl-8">
          <h1 className="font-montserrat font-bold text-6xl text-white">
            Only the <br /> Best for <br />
            your pet
          </h1>
        </div>

        <div className="overflow-hidden">
          <Image
            src="/Rectangle.svg"
            height={48}
            width={48}
            alt="Image"
            className="object-contain h-72 w-96 "
          />
        </div>
      </div>
      <div className="flex flex-col gap-5 px-32 py-5  z-0">
        <div className="w-full grid grid-cols-5 gap-5 ">
          <div className="col-span-5 flex flex-row justify-between items-center">
            <h1 className="col-span-5 font-montserrat text-3xl text-[#393939] font-bold my-4">
              Products
            </h1>
            <Link
              href="/Shopping"
              className="text-sm font-montserrat font-bold italic text-[#4ABEC5] flex flex-col gap-1"
            >
              View List Products
              <span className="w-full h-1 rounded-full bg-[#4ABEC5]" />
            </Link>
          </div>

          {products.slice(0, 10).map((data) => {
            return (
              <a
                href={`/Product/${data?.id}`}
                key={data?.id}
                className="grid grid-rows-11 z-[1] gap-2 bg-white rounded-lg px-3 py-4 hover:border-blue-500 hover:border-[1px] drop-shadow-xl cursor-pointer h-64 transform transition-all active:scale-95 ease-out duration-50 select-none"
              >
                <div className="flex justify-center row-span-5">
                  <FontAwesomeIcon icon={faFileShield} className="text-8xl" />
                </div>
                <div className="font-hind text-xs text-[#565656]">
                  {data?.Seller_UserFullName}
                </div>
                <div className="row-span-2 text-ellipsis font-hind text-sm text-[#565656] font-semibold">
                  {data?.Seller_ProductName || "Product Name"}{" "}
                </div>
                <div className="font-hind text-sm text-[#565656] font-semibold">
                  Php {data?.Seller_ProductPrice || "Price"}
                </div>
                <button className="row-span-2 bg-blue-500 text-white font-hind rounded-md">
                  View Item
                </button>
              </a>
            );
          })}
        </div>
        <div className="w-full grid grid-cols-5 gap-5 ">
          <div className="col-span-5 flex flex-row justify-between items-center">
            <h1 className="col-span-5 font-montserrat text-3xl text-[#393939] font-bold my-4">
              Food
            </h1>
            <Link
              href="/Shopping"
              className="text-sm font-montserrat font-bold italic text-[#4ABEC5] flex flex-col gap-1"
            >
              View Food Products
              <span className="w-full h-1 rounded-full bg-[#4ABEC5]" />
            </Link>
          </div>
          {food.slice(0, 5).map((data) => {
            return (
              <a
                href={`/Product${data?.id}`}
                key={data?.id}
                className="grid grid-rows-11 z-[1] gap-2 bg-white rounded-lg px-3 py-4 hover:border-blue-500 hover:border-[1px] drop-shadow-xl cursor-pointer h-64 transform transition-all active:scale-95 ease-out duration-50 select-none"
              >
                <div className="flex justify-center row-span-5">
                  <FontAwesomeIcon icon={faFileShield} className="text-8xl" />
                </div>
                <div className="font-hind text-xs text-[#565656]">
                  {data?.Seller_UserFullName}
                </div>
                <div className="row-span-2 text-ellipsis font-hind text-sm text-[#565656] font-semibold">
                  {data?.Seller_ProductName || "Product Name"}{" "}
                </div>
                <div className="font-hind text-sm text-[#565656] font-semibold">
                  Php {data?.Seller_ProductPrice || "Price"}
                </div>
                <button className="row-span-2 bg-blue-500 text-white font-hind rounded-md">
                  View Item
                </button>
              </a>
            );
          })}
        </div>
        <div className="w-full grid grid-cols-5 gap-5 ">
          <div className="col-span-5 flex flex-row justify-between items-center">
            <h1 className="col-span-5 font-montserrat text-3xl text-[#393939] font-bold my-4">
              Pet Items
            </h1>
            <Link
              href="/Shopping"
              className="text-sm font-montserrat font-bold italic text-[#4ABEC5] flex flex-col gap-1"
            >
              View List Item
              <span className="w-full h-1 rounded-full bg-[#4ABEC5]" />
            </Link>
          </div>
          {item.slice(0, 5).map((data) => {
            return (
              <Link
                href="/Product"
                key={data?.id}
                className="grid grid-rows-11 z-[1] gap-2 bg-white rounded-lg px-3 py-4 hover:border-blue-500 hover:border-[1px] drop-shadow-xl cursor-pointer h-64 transform transition-all active:scale-95 ease-out duration-50 select-none"
              >
                <div className="flex justify-center row-span-5">
                  <FontAwesomeIcon icon={faFileShield} className="text-8xl" />
                </div>
                <div className="font-hind text-xs text-[#565656]">
                  {data?.Seller_UserFullName}
                </div>
                <div className="row-span-2 text-ellipsis font-hind text-sm text-[#565656] font-semibold">
                  {data?.Seller_ProductName || "Product Name"}{" "}
                </div>
                <div className="font-hind text-sm text-[#565656] font-semibold">
                  Php {data?.Seller_ProductPrice || "Price"}
                </div>
                <button className="row-span-2 bg-blue-500 text-white font-hind rounded-md">
                  View Item
                </button>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="w-full grid grid-cols-3 gap-5 px-32 my-4">
        <div className="col-span-3 flex flex-row justify-between items-center">
          <h1 className="font-montserrat text-3xl text-[#393939] font-bold my-4">
            Rooms
          </h1>
          <Link
            href="/Booking"
            className="text-sm font-montserrat font-bold italic text-[#4ABEC5] flex flex-col gap-1"
          >
            View List Room
            <span className="w-full h-1 rounded-full bg-[#4ABEC5]" />
          </Link>
        </div>
        {room.slice(0, 5).map((data) => {
          return (
            <Link
              href={`/Booking/${data?.id}`}
              key={data?.id}
              className="grid grid-rows-11 z-[1] gap-2 bg-white rounded-lg px-3 py-4 hover:border-blue-500 hover:border-[1px] drop-shadow-xl cursor-pointer h-64 w-72 transform transition-all active:scale-95 ease-out duration-50 select-none"
            >
              <div className="flex justify-center row-span-5">
                <FontAwesomeIcon icon={faFileShield} className="text-8xl" />
              </div>
              <div className="font-hind text-xs text-[#565656]">
                {data?.Renter_UserFullName}
              </div>
              <div className="row-span-2 text-ellipsis font-hind text-sm text-[#565656] font-semibold">
                {data?.Renter_RoomName || "Room Name"}{" "}
              </div>
              <div className="font-hind text-sm text-[#565656] font-semibold">
                Php {data?.Renter_RoomPrice || "Price"}
              </div>
              <button className="row-span-2 bg-blue-500 text-white font-hind rounded-md">
                View Room
              </button>
            </Link>
          );
        })}
      </div>

      <div className="w-full grid grid-cols-3 gap-5 px-32 my-8 ">
        <div className="col-span-3 flex flex-row justify-between items-center">
          <h1 className="font-montserrat text-3xl text-[#393939] font-bold my-4">
            Doctors
          </h1>
          <a
            href="/Appointments"
            className="text-sm font-montserrat font-bold italic text-[#4ABEC5] flex flex-col gap-1"
          >
            View List Of Doctors
            <span className="w-full h-1 rounded-full bg-[#4ABEC5]" />
          </a>
        </div>
        {doctor.slice(0, 5).map((data) => {
          return (
            <Link
              href={`/Profile/Doctor/${data?.User_UID}`}
              key={data?.id}
              className="grid relative grid-rows-11 z-[1] gap-2 bg-[#006B95] rounded-lg px-3 py-4 drop-shadow-2xl cursor-pointer full w-72  select-none"
            >
              <div className="flex justify-center absolute -top-12 left-24 rounded-full bg-white drop-shadow-2xl p-0.5 h-28 w-28">
                <h1 className="h-full w-full bg-blue-500 rounded-full flex justify-center items-center text-center font-montserrat font-medium text-xs">
                  Image of the doctor
                </h1>
              </div>
              <div className="row-span-11 flex flex-col justify-between gap-2 mt-16">
                <div className="font-hind font-bold text-xl text-white text-center">
                  {data?.User_Name}
                </div>
                <h1 className="text-center font-hind text-base text-white font-medium row-span-5 grid grid-cols-2 gap-2 mt-2 bg-blue-500 rounded-sm py-2">
                  <span className="col-span-2">Appointment Type:</span>
                  {data?.User_TypeOfAppointment?.map((data, index) => {
                    return (
                      <span
                        key={index}
                        className="overflow-hidden text-ellipsis whitespace-nowrap"
                      >
                        {data}
                      </span>
                    );
                  })}
                </h1>{" "}
                <h1 className="text-center font-hind text-white font-medium row-span-5 bg-red-500 py-2 rounded-lg">
                  Available Days: <br />
                  <span className="grid grid-cols-3 items-start">
                    {data?.User_AvailableHours?.Days?.length ? (
                      data.User_AvailableHours.Days.map((day, dayIndex) => {
                        const weekDay = weeks.find(
                          (week) => week.key === day
                        )?.label;
                        return (
                          <span key={dayIndex} className="">
                            {weekDay}
                          </span>
                        );
                      })
                    ) : (
                      <span>No available days</span>
                    )}
                  </span>
                </h1>
                <Link
                  href={`/Profile/Doctor/${data?.User_UID}`}
                  className="row-span-2 bg-white font-hind rounded-md h-10 transform transition-all active:scale-95 ease-out duration-50 flex items-center justify-center"
                >
                  View Doctor
                </Link>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
