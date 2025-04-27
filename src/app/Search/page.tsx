"use client";

import { DatePicker, Modal, Rate, Select } from "antd";
import { useEffect, useState } from "react";
import "@ant-design/v5-patch-for-react-19";
import {
  collection,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import Image from "next/image";
import { db } from "../firebase/config";
import Loading from "../Loading/page";
import ClientNavbar from "../ClientNavbar/page";
import Link from "next/link";

interface Doctor {
  id?: string;
  doctor_available_days?: number[];
  doctor_pet_types_treated?: string[];
  doctor_clinicAddress?: string;
  doctor_clinicName?: string;
  doctor_contact?: string;
  doctor_email?: string;
  doctor_experience?: number;
  doctor_license_number?: string;
  doctor_name?: string;
  doctor_rating?: number;
  doctor_specialty?: string;
  doctor_standard_fee?: number;
  doctor_sub_specialty?: string;
  doctor_time_in?: string;
  doctor_time_out?: string;
  doctor_title?: string;
  doctor_uid?: string;
}

interface Product {
  id: string;
  Seller_PaymentMethod?: string;
  Seller_TotalPrice?: string;
  Seller_ProductName?: string;
  Seller_ProductDescription?: string;
  Seller_ProductPrice?: number;
  Seller_UserID?: string;
  Seller_ProductFeatures?: string;
  Seller_UserFullName?: string;
  Seller_TotalRating?: number;
}

interface Room {
  id?: string;
  Renter_Location?: string;
  Renter_PaymentMethod?: string;
  Renter_RoomDescription?: string;
  Renter_RoomName?: string;
  Renter_RoomPrice?: number;
  Renter_RoomStatus?: string;
  Renter_Room_Total_Rating?: number;
  Renter_TotalPrice?: number;
  Renter_TypeOfRoom?: string;
  Renter_UserFullName?: string;
  Renter_Contact?: string;
  Renter_UserEmail?: string;
}

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

interface Sitters {
  id?: string;
  sitter_contact?: string;
  sitter_email?: string;
  sitter_fullname?: string;
  sitter_isExperience?: boolean;
  sitter_type_of_payments?: [];
  sitter_isOkayOnHoliday?: [];
  sitter_uid?: string;
  sitter_working_days?: [];
}

export default function Search() {
  const [providerModal, setProviderModal] = useState(true);
  const [serviceModal, setServiceModal] = useState(false);

  const [ratingModal, setRatingModal] = useState(false);
  const [pricingModal, setPricingModal] = useState(false);
  const [chronoModal, setChronoModal] = useState(false);
  const [animalModal, setAnimalModal] = useState(false);
  const [provider, setProvider] = useState("");
  const [service, setService] = useState("");
  const [product, setProduct] = useState<Product[]>([]);
  const [filteredProduct, setFilteredProduct] = useState<Product[]>([]);
  const [docSearch, setDocSearch] = useState<Doctor[]>([]);
  const [room, setRoom] = useState<Room[]>([]);
  const [rating, setRating] = useState(0);
  const [pricing, setPricing] = useState(0);
  const [date, setDate] = useState<Timestamp | null>(null);
  const [loading, setLoading] = useState(false);
  const [animal, setAnimal] = useState("");
  const [roomSearch, setRoomSearch] = useState<Room[]>([]);
  const [searchFilter, setSearchFilter] = useState(false);
  const [typeOfRoom, setTypeOfRoom] = useState("");
  const [memorial, setMemorial] = useState<Memorial[]>([]);
  const [sitter, setSitter] = useState<Sitters[]>([]);

  console.log(date);

  console.log(provider);

  const providers = [
    {
      key: 0,
      value: `seller`,
      label: `Product Sellers`,
    },
    {
      key: 1,
      value: `doctor`,
      label: `Pet Vetirinary`,
    },
    {
      key: 2,
      value: `room-provider`,
      label: `Room Boarding House for Pets`,
    },
    {
      key: 3,
      value: `sitter`,
      label: `Pet Sitter`,
    },
    {
      key: 4,
      value: `memorial`,
      label: `Memorial for Pets`,
    },
  ];

  const doctorServices = [
    {
      key: 0,
      label: "Surgery",
      value: "Surgery",
    },
    {
      key: 1,
      label: "Dentistry",
      value: "Dentistry",
    },
    {
      key: 2,
      label: "Dermatology",
      value: "Dermatology",
    },
    {
      key: 3,
      label: "Behavior",
      value: "Behavior",
    },
    {
      key: 4,
      label: "Cardiology",
      value: "Cardiology",
    },

    {
      key: 5,
      label: "Internal Medicine",
      value: "Internal Medicine",
    },

    {
      key: 6,
      label: "Neurology",
      value: "Neurology",
    },
    {
      key: 7,
      label: "Oncology",
      value: "Oncology",
    },
    {
      key: 8,
      label: "Ophthalmology",
      value: "Ophthalmology",
    },
    {
      key: 9,
      label: "Theriogenology",
      value: "Theriogenology",
    },
    {
      key: 10,
      label: "Exotic Companion Mammal Practice",
      value: "Exotic Companion Mammal Practice",
    },
    {
      key: 11,
      label: "Avian Medicine",
      value: "Avian Medicine",
    },
    {
      key: 12,
      label: "Reptile/Amphibian Practice",
      value: "Reptile/Amphibian Practice",
    },
    {
      key: 13,
      label: "Canine/Feline Practice",
      value: "Canine/Feline Practice",
    },
    {
      key: 14,
      label: "Anesthesia",
      value: "Anesthesia",
    },
  ];

  const providerRating = [
    {
      key: 0,
      value: 1,
      label: <Rate disabled value={1} />,
    },
    {
      key: 1,
      value: 2,
      label: <Rate disabled value={2} />,
    },
    {
      key: 2,
      value: 3,
      label: <Rate disabled value={3} />,
    },
    {
      key: 3,
      value: 4,
      label: <Rate disabled value={4} />,
    },
    {
      key: 4,
      value: 5,
      label: <Rate disabled value={5} />,
    },
  ];

  const weeks = [
    {
      key: 0,
      value: 0,
      label: "Sunday",
    },
    {
      key: 1,
      value: 1,
      label: "Monday",
    },
    {
      key: 2,
      value: 2,
      label: "Tuesday",
    },
    {
      key: 3,
      value: 3,
      label: "Wednesday",
    },
    {
      key: 4,
      value: 4,
      label: "Thursday",
    },
    {
      key: 5,
      value: 5,
      label: "Friday",
    },
    {
      key: 6,
      value: 6,
      label: "Saturday",
    },
  ];

  const doctorStandarFee = [
    {
      key: 0,
      value: 500,
      label: "500 below ",
    },
    {
      key: 1,
      value: 1000,
      label: "1000 below ",
    },
    {
      key: 2,
      value: 1500,
      label: "1500 below ",
    },
    {
      key: 3,
      value: 2000,
      label: "2000 below ",
    },
    {
      key: 4,
      value: 2500,
      label: "2500 below ",
    },
    {
      key: 5,
      value: 2501,
      label: "2500 above ",
    },
  ];

  const animalType = [
    {
      key: 0,
      value: "dogs",
      label: "Dog",
    },
    {
      key: 1,
      value: "cats",
      label: "Cat",
    },
    {
      key: 2,
      value: "birds",
      label: "Birds",
    },
    {
      key: 3,
      value: "reptiles",
      label: "Reptiles",
    },
    {
      key: 4,
      value: "exotic animal",
      label: "Exotic Animals",
    },
  ];

  useEffect(() => {
    const getRoom = async () => {
      try {
        const docRef = collection(db, "board");
        const docSnap = await getDocs(docRef);

        const result: Room[] = docSnap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            Renter_RoomPrice: Number(data.Renter_RoomPrice),
            ...data,
          };
        });

        setRoom(result);
      } catch (error) {
        console.error(error);
      }
    };
    getRoom();
  }, []);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const searchRef = collection(db, "products");
        const querySnapshot = await getDocs(searchRef);

        const products = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProduct(products);
      } catch (error) {
        console.error(error);
      }
    };

    getProducts();
  }, []);

  useEffect(() => {
    const getSitters = async () => {
      try {
        if (provider !== "sitter") {
          return;
        }
        const docRef = collection(db, "sitter");
        const q = query(docRef, where("sitter_total_rating", "<=", rating));
        const docSnap = await getDocs(q);

        const result = docSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setSitter(result);
      } catch (error) {
        console.error(error);
        return [];
      }
    };
    getSitters();
  }, [rating, provider]);

  useEffect(() => {
    const getMemorialProviders = async () => {
      try {
        if (provider !== "memorial") {
          return;
        }
        const memorialRef = collection(db, "memorial");
        const q = query(
          memorialRef,
          where("mortician_total_rating", "<=", rating)
        );
        const docSnap = await getDocs(q);

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
  }, [provider, rating]);

  const searchHandle = async () => {
    try {
      setLoading(true);
      setSearchFilter(true);
      const searchRef = collection(db, provider);
      if (provider === "doctor") {
        if (!date) {
          throw new Error("Please select a valid date.");
        }

        const logical = pricing === 2501 ? `>=` : `<`;

        console.log("Logical: ", logical);

        const q = query(
          searchRef,
          where("doctor_specialty", "==", service),
          where("doctor_rating", "==", rating),
          where("doctor_standard_fee", logical, pricing),
          where(
            "doctor_available_days",
            "array-contains",
            date.toDate().getDay()
          )
        );

        const docSnap = await getDocs(q);

        const doctorSearch: Doctor[] = docSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Doctor[];

        const filteredDoctors = doctorSearch.filter((doc) =>
          doc.doctor_pet_types_treated?.includes(animal)
        );

        setDocSearch(filteredDoctors);

        if (filteredDoctors.length === 0) {
          console.warn("No matching doctors found.");
        }
      }

      if (provider === "seller") {
        const filteredProducts = product.filter(
          (doc) =>
            doc.Seller_ProductName?.includes(service) &&
            doc.Seller_TotalRating === rating &&
            doc.Seller_ProductDescription?.includes(service) &&
            doc.Seller_ProductPrice &&
            0 <= pricing
        );

        setFilteredProduct(filteredProducts);
      }

      if (provider === "room-provider") {
        setLoading(true);
        const filteredRooms = room.filter((r) => {
          const ratingMatch =
            !rating || Number(r.Renter_Room_Total_Rating) >= rating;
          const pricingMatch =
            !pricing ||
            (r.Renter_RoomPrice !== undefined && r.Renter_RoomPrice <= pricing);
          const typeMatch = !typeOfRoom || r.Renter_TypeOfRoom === typeOfRoom;
          const statusMatch = r.Renter_RoomStatus === "vacant";

          return ratingMatch && pricingMatch && typeMatch && statusMatch;
        });
        setRoomSearch(filteredRooms);
      }

      if (provider === "sitter") {
        setLoading(true);
      }

      if (provider === "memorial") {
        setLoading(true);
      }
    } catch (error) {
      console.error("Error during search:", error);
      alert(`An error occurred: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  console.log(memorial);

  return (
    <div>
      {searchFilter ? (
        <div className="">
          {loading && <Loading />}
          {!loading && provider === "doctor" && (
            <div className="h-full mx-52">
              <nav className="relative z-20">
                <ClientNavbar />
              </nav>
              <h1 className="mt-16 mb-6 font-montserrat font-bold text-3xl text-[#006B95] capitalize">
                List Of {provider}
              </h1>
              {docSearch.map((data, index) => {
                return (
                  <div
                    key={index}
                    className="relative px-5 py-10 border-[#B1B1B1] gap-5 border-[1px] grid grid-cols-6 bg-white drop-shadow-lg rounded-lg h-56"
                  >
                    <div className="flex items-center justify-center">
                      <h1 className="font-montserrat text-center font-bold text-2xl">
                        {data?.doctor_name} Image
                      </h1>
                    </div>
                    <div className="flex flex-col gap-1 text-center justify-center">
                      <h1 className="font-montserrat font-bold text-[#393939]">
                        Name: {data?.doctor_name}
                      </h1>
                    </div>
                    <div className="flex flex-col gap-1 text-center justify-center">
                      <h1 className="font-hind text-[#393939]">
                        Speciality:{" "}
                        <span className="block font-bold text-[#006B95]">
                          {data?.doctor_specialty}
                        </span>
                      </h1>
                      <h1 className="font-hind text-[#393939]">
                        Sub-Speciality:{" "}
                        <span className="block font-montserrat font-bold text-[#006B95]">
                          {data?.doctor_sub_specialty}
                        </span>
                      </h1>
                      <h1 className="font-montserrat  text-[#232323] text-xl font-bold">
                        Standard Fee: Php {data?.doctor_standard_fee}
                      </h1>
                    </div>
                    <div className="grid grid-cols-2 gap-2 col-span-2">
                      <div className="flex flex-col text-start gap-2 justify-center font-montserrat font-bold">
                        {data?.doctor_available_days?.map((day, dayIndex) => {
                          const weekDay = weeks.find(
                            (week) => week.key === day
                          )?.label;
                          return <span key={dayIndex}>{weekDay}</span>;
                        })}
                      </div>
                      <div className="flex flex-col gap-2">
                        <h1 className="font-hind text-[#292929] font-semibold">
                          Check_In:{" "}
                          <span className="block">{data?.doctor_time_in}</span>
                        </h1>
                        <h1 className="font-hind text-[#292929] font-semibold">
                          Check_Out:{" "}
                          <span className="block">{data?.doctor_time_out}</span>
                        </h1>
                      </div>
                    </div>
                    <div className="flex flex-col text-start pl-10 gap-2 justify-center font-montserrat font-bold">
                      {data?.doctor_pet_types_treated?.map((pet, index) => {
                        return (
                          <p key={index} className="capitalize text-[#006B95]">
                            {pet}
                          </p>
                        );
                      })}
                    </div>
                    <div className="absolute left-5 top-4">
                      <Rate disabled value={data?.doctor_rating} />
                    </div>
                    <Link
                      href={`/Profile/Doctor/${data?.doctor_uid}`}
                      className="absolute top-4 right-5 border-b-2 border-[#006B95] px-2 text-[#006B95] italic"
                    >
                      View Profile Doctor
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
          {!loading && provider === "seller" && (
            <div>
              <div className="relative z-20">
                <ClientNavbar />
              </div>
              <h1 className="font-montserrat font-bold text-2xl text-[#393939] mx-56 my-10">
                List Of Products:{" "}
              </h1>
              {filteredProduct.map((data, index) => {
                return (
                  <div
                    key={index}
                    className="mx-56 grid grid-cols-5 p-4 border-[1px] border-slate-300 h-48 rounded-lg drop-shadow-md bg-white"
                  >
                    <div className=" font-hind text-[#393939] h-16 w-16 rounded-full m-auto border-[1px] border-[#393939] overflow-hidden">
                      Image of {data?.Seller_ProductName}
                    </div>
                    <div className="col-span-2 my-auto flex flex-col gap-1">
                      <h1 className="capitalize font-montserrat font-bold text-[#393939]">
                        {data?.Seller_UserFullName}
                      </h1>
                      <h1 className="font-montserrat font-bold text-[#006B95]">
                        {" "}
                        {data?.Seller_ProductName}
                      </h1>
                      <h1 className="font-montserrat font-bold text-[#393939]">
                        Type of Payment:
                        <span className="block text-[#006B95]">
                          {data?.Seller_PaymentMethod}
                        </span>
                      </h1>
                    </div>
                    <h1 className="m-auto font-montserrat font-bold text-lg text-[#393939]">
                      Php {data?.Seller_ProductPrice}
                    </h1>
                    <Rate
                      value={data?.Seller_TotalRating}
                      disabled
                      className="m-auto"
                    />
                    <Link
                      href={`/Product/${data?.id}`}
                      className="font-hind italic text-[#006B95] absolute right-9 top-4 border-b-2 border-[#006B95] text-center w-28"
                    >
                      View Product
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
          {!loading && provider === "room-provider" && (
            <div>
              <nav className="relative z-20">
                <ClientNavbar />
              </nav>

              <div className="mx-60">
                <h1 className="font-montserrat font-bold text-[#393939] text-3xl my-8">
                  List Of All Room Search
                </h1>
                {roomSearch.map((data, index) => {
                  return (
                    <div
                      key={index}
                      className="grid grid-cols-7 h-fit w-full px-4 pt-3 pb-6 bg-white drop-shadow-md relative rounded-xl"
                    >
                      <Rate
                        className="col-span-7 my-4"
                        value={data?.Renter_Room_Total_Rating}
                      />
                      <div className=" col-span-2 mr-4 flex items-center justify-center font-montserrat font-bold text-xl rounded-lg border-slate-300 border-[1px] bg-white drop-shadow-md">
                        {data?.Renter_RoomName}
                      </div>
                      <div className="col-span-5 ml-4">
                        <div className="font-hind text-base">
                          <h1 className="mb-2 text-[#393939] font-montserrat font-bold text-2xl">
                            Description:
                          </h1>
                          {data?.Renter_RoomDescription}
                        </div>
                        <div className="w-full h-1 rounded-full bg-gray-400 my-4" />
                        <div className="flex flex-row justify-between ">
                          <div className="flex flex-col gap-4">
                            <h1 className="font-montserrat text-[#393939] font-medium">
                              Owner:{" "}
                              <span className="capitalize font-montserrat font-bold text-[#006B95] overflow-hidden text-ellipsis">
                                {data?.Renter_UserFullName}
                              </span>
                            </h1>
                            <h1 className="font-montserrat text-[#393939] font-medium">
                              Email:{" "}
                              <span className=" font-montserrat font-bold text-[#006B95] overflow-hidden text-ellipsis">
                                {data?.Renter_UserEmail}
                              </span>
                            </h1>
                            <h1 className="font-montserrat text-[#393939] font-medium">
                              Contact:{" "}
                              <span className=" font-montserrat font-bold text-[#006B95]">
                                {data?.Renter_Contact}
                              </span>
                            </h1>
                          </div>
                          <div className="flex flex-col gap-4">
                            <h1 className="font-montserrat text-[#393939] font-medium">
                              Price:{" "}
                              <span className="capitalize font-montserrat font-bold text-[#006B95]">
                                {data?.Renter_RoomPrice}
                              </span>
                            </h1>
                            <h1 className="font-montserrat text-[#393939] font-medium overflow-hidden text-ellipsis">
                              Type Of Room:{" "}
                              <span className="capitalize font-montserrat font-bold text-[#006B95]">
                                {data?.Renter_TypeOfRoom}
                              </span>
                            </h1>
                            <h1 className="font-montserrat text-[#393939] font-medium">
                              Status:{" "}
                              <span className="capitalize font-montserrat font-bold text-[#006B95]">
                                {data?.Renter_RoomStatus}
                              </span>
                            </h1>
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/Booking/${data?.id}`}
                        className="font-hind text-[#006B95] italic w-fit absolute right-4 font-semibold underline"
                      >
                        View Room More
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!loading && provider === "sitter" && (
            <div>
              <nav className="relative z-20">
                <ClientNavbar />
              </nav>
              <div className="mx-60 mt-16">
                <h1 className="my-8 font-montserrat font-bold text-2xl text-[#393939]">
                  List Of Pet Sittes Filter
                </h1>
                {sitter.map((data, index) => {
                  return (
                    <div
                      key={index}
                      className="grid grid-cols-7 bg-white drop-shadow-md h-32 items-center rounded-lg pt-4 relative"
                    >
                      <div className="font-montserrat font-bold mx-auto capitalize h-14 w-14 rounded-full border-slate-300 border-[1px] text-xl text-[#393939] flex justify-center items-center">
                        {data?.sitter_fullname?.charAt(0)}
                      </div>
                      <div className="col-span-6 flex flex-row justify-evenly">
                        <div>
                          <h1 className="font-montserrat font-bold text-[#393939] capitalize">
                            {data?.sitter_fullname}
                          </h1>
                          <h1>{data?.sitter_email}</h1>
                        </div>
                        <div>{data?.sitter_contact}</div>
                        <div>
                          {data?.sitter_isOkayOnHoliday &&
                            `Can Work On holidays`}
                        </div>
                      </div>
                      <Link
                        href={`/Profile/Sitter/${data?.id}`}
                        className="font-montserrat font-bold text-[#006B95] italic underline absolute top-0 right-8"
                      >
                        View Profile Sitter
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {!loading && provider === "memorial" && (
            <div>
              <nav className="relative z-20">
                <ClientNavbar />
              </nav>
              <div className="mx-72">
                <h1 className="font-montserrat font-bold text-2xl my-8">
                  List Of Memorial Filter
                </h1>
                {memorial?.map((data, index) => {
                  return (
                    <div
                      key={index}
                      className="grid grid-cols-7 bg-white rounded-lg h-36 items-center drop-shadow-md relative"
                    >
                      <div className="h-14 w-14 mx-auto rounded-full capitalize border-slate-300 border-[1px] font-montserrat font-bold text-xl flex items-center justify-center">
                        {data?.mortician_fullname?.charAt(0)}
                      </div>
                      <div className="flex flex-row justify-evenly col-span-6">
                        <div>
                          <h1 className="font-montserrat font-bold text-[#393939] capitalize">
                            {data?.mortician_fullname}
                          </h1>
                          <h1 className="text-[#006B95] font-medium">
                            {data?.mortician_email}
                          </h1>
                        </div>
                        <div>
                          <h1 className="text-[#393939] font-medium">
                            +63 {data?.mortician_contact}
                          </h1>
                          <h1 className="font-montserrat">
                            {data?.mortician_memorial_address}
                          </h1>
                        </div>
                        <div className="capitalize font-montserrat font-bold text-[#393939]">
                          {data?.morticial_memorial_services?.join(", ")}
                        </div>
                      </div>
                      <Link
                        href={`/Profile/Memorial/${data?.id}`}
                        className="font-montserrat font-medium underline text-[#006B95] absolute top-0 right-10 italic"
                      >
                        View Memorial More
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <Modal
            open={providerModal}
            centered
            className="flex flex-row"
            onCancel={() => {
              history.back();
            }}
            onOk={() => {
              // Check if the provider is sitter or memorial, then show the ratingModal
              if (provider === "sitter" || provider === "memorial") {
                setRatingModal(true);
                setProviderModal(false);
              } else {
                setProviderModal(false);
                setServiceModal(true); // Open serviceModal if not sitter or memorial
              }
            }}
          >
            <Select
              placeholder="Select a type of Providers"
              className="my-20 mx-28 h-10 w-72 font-montserrat font-bold text-lg"
              optionFilterProp="label"
              options={providers}
              onChange={(value: string) => {
                setProvider(value);
                // If provider is sitter or memorial, show ratingModal
                if (value === "sitter" || value === "memorial") {
                  setRatingModal(true);
                  setProviderModal(false);
                  setServiceModal(false); // Make sure serviceModal is closed
                } else {
                  // For other providers, open serviceModal and close ratingModal
                  setRatingModal(false);
                  setServiceModal(true);
                  setProviderModal(false);
                }
              }}
            />
          </Modal>

          <Modal
            onCancel={() => {
              setServiceModal(false);
              setProviderModal(true);
            }}
            open={serviceModal}
            centered
            className="flex flex-row"
            onOk={() => {
              setRatingModal(
                service ? true : false || typeOfRoom ? true : false
              );
              setServiceModal(
                service ? false : true || typeOfRoom ? false : true
              );
            }}
          >
            {provider === "doctor" && (
              <div>
                <Select
                  className="my-20 mx-28 h-10 w-72 font-montserrat font-bold text-lg"
                  optionFilterProp="label"
                  placeholder="Select a type of doctor's services"
                  options={doctorServices}
                  onChange={(value: string) => {
                    setService(value);
                    setServiceModal(false);
                    setRatingModal(true);
                  }}
                />
              </div>
            )}
            {provider === "seller" && (
              <div className="">
                <label
                  htmlFor="product-id"
                  className="font-montserrat font-bold text-lg text-[#393939]"
                >
                  Enter your product
                </label>
                <input
                  type="text"
                  name="product"
                  id="product-id"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="block h-10 py-2 px-2 w-3/4 rounded-md border-[1.5px] text-[#393939]  font-semibold border-[#393939] outline-none font-hind "
                />
              </div>
            )}
            {provider === "room-provider" && (
              <div>
                <label
                  htmlFor="room-id"
                  className="font-montserrat font-bold text-lg text-[#393939]"
                >
                  Enter your type of room
                </label>
                <input
                  type="text"
                  name="product"
                  id="product-id"
                  value={typeOfRoom}
                  placeholder="Ex. VIP, Presidential Suite Room, Deluxe Room"
                  onChange={(e) => setTypeOfRoom(e.target.value)}
                  className="block h-10 py-2 px-2 w-3/4 rounded-md border-[1.5px] text-[#393939]  font-semibold border-[#393939] outline-none font-hind "
                />
              </div>
            )}
          </Modal>

          <Modal
            onOk={() => {
              if (provider === "sitter" || provider === "memorial") {
                setPricingModal(false);
                setRatingModal(false);
              } else {
                setPricingModal(rating ? true : false);
                setRatingModal(rating ? false : true);
              }
            }}
            open={ratingModal}
            centered
            onCancel={() => {
              if (provider === "sitter" || provider === "memorial") {
                setRatingModal(false);
                setProviderModal(true);
              } else {
                setRatingModal(false);
                setServiceModal(true);
              }
            }}
          >
            <h1 className="font-montserrat font-bold text-2xl text-[#393939]">
              Ratings
            </h1>
            <div className="flex justify-center mt-10 mb-16">
              <Select
                placeholder="Please select number of rating"
                className="h-11"
                onChange={(value) => {
                  setRating(value);
                  if (provider === "sitter" || provider === "memorial") {
                    setPricingModal(false);
                    setRatingModal(false);
                  }
                }}
                options={providerRating}
              />
            </div>
          </Modal>
          <Modal
            open={pricingModal}
            centered
            onCancel={() => {
              setRatingModal(true);
              setPricingModal(false);
            }}
            onOk={() => {
              if (
                provider === "room-provider" ||
                provider === "seller" ||
                provider === "sitter" ||
                provider === "memorial"
              ) {
                setChronoModal(false);
              }
              setPricingModal(false);
              if (
                provider === "room-provider" ||
                provider === "sitter" ||
                provider === "memorial"
              ) {
                setAnimalModal(false);
              } else {
                setAnimalModal(true);
              }
            }}
            onClose={() => history.back()}
          >
            <div className="my-5 grid grid-rows-3 items-center">
              <h1 className="font-montserrat  font-bold text-[#393939] text-2xl mb-4">
                Pricing
              </h1>

              <Select
                allowClear
                options={doctorStandarFee}
                onChange={(value: number) => {
                  setPricing(value);
                  if (
                    provider === "seller" ||
                    provider === "room-provider" ||
                    provider === "sitter" ||
                    provider === "memorial"
                  ) {
                    setChronoModal(false);
                  } else {
                    setChronoModal(true);
                  }
                  setPricingModal(false);
                }}
              />
            </div>
          </Modal>
          <Modal
            open={chronoModal}
            centered
            onCancel={() => {
              setPricingModal(true);
              setChronoModal(false);
            }}
            onOk={() => {
              setAnimalModal(date !== null ? true : false);
              setChronoModal(date !== null ? false : true);
            }}
          >
            <div className="grid grid-cols-2">
              <h1 className="font-montserrat col-span-2 font-bold text-lg">
                Date
              </h1>
              <DatePicker onChange={(date: Timestamp) => setDate(date)} />
            </div>
          </Modal>
          <Modal
            open={animalModal}
            centered
            onCancel={() => {
              setChronoModal(provider === "seller" ? false : true);
              setAnimalModal(false);
              setPricingModal(provider === "seller" ? true : false);
            }}
            onOk={() => setAnimalModal(animal ? false : true)}
          >
            <div className="my-5 grid grid-rows-3 items-center">
              <h1 className="font-montserrat col-span-2 font-bold text-lg">
                Animal Type
              </h1>

              <Select
                allowClear
                onChange={(value: string) => setAnimal(value)}
                options={animalType}
              />
            </div>
          </Modal>
          <div className="h-screen grid grid-cols-3 pt-10 pb-8">
            <div className="flex flex-col mx-8 gap-24 bg-white drop-shadow-md rounded-lg ">
              <div className="w-full h-56 bg-dashboard  rounded-lg">
                <Image
                  alt={`asdasdasd`}
                  src={`/doctor.svg`}
                  width={110}
                  height={50}
                  className="object-contain w-full h-full"
                />
              </div>

              <h1 className="capitalize text-xl font-montserrat mx-8 text-center font-medium text-nowrap bg-[#006B95] px-12 py-6 text-white drop-shadow-md rounded-md">
                Provider Type:
                <span className="block text-2xl text-white font-bold">
                  {provider}
                </span>
              </h1>
              {provider === "doctor" && (
                <h1 className="text-xl capitalize font-montserrat mx-8 text-center font-medium bg-[#006B95] px-12 py-6 text-white drop-shadow-md rounded-md">
                  Service Type:
                  <span className="block text-2xl text-white font-bold">
                    {service}
                  </span>
                </h1>
              )}
              {provider === "seller" && (
                <h1 className="text-xl capitalize font-montserrat mx-8 text-center font-medium bg-[#006B95] px-12 py-6 text-white drop-shadow-md rounded-md">
                  Product:
                  <span className="block text-2xl text-white font-bold">
                    {service}
                  </span>
                </h1>
              )}

              {provider === "room-provider" && (
                <h1 className="text-xl capitalize font-montserrat mx-8 text-center font-medium bg-[#006B95] px-12 py-6 text-white drop-shadow-md rounded-md">
                  Type Of Room:
                  <span className="block text-2xl text-white font-bold">
                    {typeOfRoom}
                  </span>
                </h1>
              )}

              {!provider ? (
                <h1 className="text-xl capitalize font-montserrat mx-8 text-center font-medium bg-[#006B95] px-12 py-6 text-white drop-shadow-md rounded-md">
                  Service Type:
                  <span className="block text-2xl text-white font-bold">
                    {service}
                  </span>
                </h1>
              ) : (
                <div></div>
              )}
            </div>
            <div className="flex flex-col mx-8 gap-10 text-white bg-white drop-shadow-md rounded-lg">
              <div className="w-full h-56 bg-dashboard  rounded-lg">
                <Image
                  alt={`asdasdasd`}
                  src={`/doctor.svg`}
                  width={110}
                  height={50}
                  className="object-contain w-full h-full"
                />
              </div>
              <h1 className="text-xl capitalize font-montserrat text-center font-medium  mx-8  bg-[#006B95] px-12 py-6 text-white drop-shadow-md rounded-md">
                Rating:
                <span className="block text-2xl text-white font-bold">
                  <Rate disabled value={rating} />
                </span>
              </h1>
              {provider !== "sitter" && provider !== "memorial" && (
                <h1 className="text-xl capitalize font-montserrat text-center font-medium  mx-8  bg-[#006B95] px-12 py-6 text-white drop-shadow-md rounded-md">
                  Pricing:
                  <span className="block text-2xl text-white font-bold">
                    {pricing !== 2501 ? `${pricing} below` : `${pricing} above`}{" "}
                  </span>
                </h1>
              )}
              {provider === "seller" ||
              provider === "room-provider" ||
              provider === "sitter" ||
              provider === "memorial" ? (
                <div></div>
              ) : (
                <h1 className="text-xl capitalize font-montserrat text-center font-medium  mx-8  bg-[#006B95] px-12 py-6 text-white drop-shadow-md rounded-md">
                  Date:
                  <span className="block text-2xl text-white font-bold">
                    {date?.toDate().toDateString()}
                  </span>
                </h1>
              )}
            </div>
            {provider !== "seller" &&
              provider !== "room-provider" &&
              provider !== "sitter" &&
              provider !== "memorial" && (
                <div className="flex flex-col mx-8 gap-24 bg-white drop-shadow-md rounded-lg">
                  <div className="w-full h-56 bg-dashboard  rounded-lg">
                    <Image
                      alt={`asdasdasd`}
                      src={`/doctor.svg`}
                      width={110}
                      height={50}
                      className="object-contain w-full h-full"
                    />
                  </div>

                  <h1 className="text-xl capitalize font-montserrat text-center font-medium  mx-8  bg-[#006B95] px-12 py-6 text-white drop-shadow-md rounded-md">
                    Animal:
                    <span className="block text-2xl text-white font-bold">
                      {animal}
                    </span>
                  </h1>
                </div>
              )}
          </div>
          <div
            className="place-self-end px-10 right-10 cursor-pointer bottom-10 absolute pt-2 bg-[#006B96] font-bold text-xl text-white font-montserrat py-2  rounded-md active:scale-95"
            onClick={searchHandle}
          >
            Search
          </div>
        </div>
      )}
    </div>
  );
}
