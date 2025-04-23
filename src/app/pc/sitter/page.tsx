"use client";

import ClientNavbar from "@/app/ClientNavbar/page";
import fetchUserData from "@/app/fetchData/fetchUserData";
import { db } from "@/app/firebase/config";
import { faCheck, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DatePicker, Modal, Rate } from "antd";
import dayjs, { Dayjs } from "dayjs";
import {
  addDoc,
  collection,
  DocumentData,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface Sitters {
  id?: string;
  sitter_address?: string;
  sitter_contact?: string;
  sitter_email?: string;
  sitter_fullname?: string;
  sitter_isExperience?: boolean;
  sitter_type_of_payments?: [];
  sitter_isOkayOnHoliday?: [];
  sitter_uid?: string;
  sitter_working_days?: [];
  sitter_total_rating?: number;
}

interface FeedbackAndRate {
  id?: string;
  sitting_service_feedback_and_rate?: {
    rate?: number;
    feedback?: string;
  };
  sitting_service_requester_name?: string;
}

export default function Sitters() {
  const router = useRouter();
  const [sitter, setSitter] = useState<Sitters[]>([]);
  const [chosenSitter, setChosenSitter] = useState<Sitters | null>(null);
  const [feedbackRate, setFeedbackRate] = useState<FeedbackAndRate[]>([]);
  const [addPostModal, setAddPostModal] = useState(false);
  const [dateStart, setDateStart] = useState<Dayjs | null>(null);
  const [dateEnd, setDateEnd] = useState<Dayjs | null>(null);
  const [userData, setUserData] = useState<DocumentData[]>([]);
  const dropDownPaymentRef = useRef<HTMLDivElement | null>(null);
  const [confirmPetSitModal, setConfirmPetSitModal] = useState(false);
  const [dropdownPayments, setDropdownPayments] = useState(false);
  const [successful, setSuccessful] = useState(false);
  const [petSitOffer, setPetSitOffer] = useState({
    price: 0,
    address: "",
    totalPrice: 0,
    day: 0,
    typeOfPayment: "",
  });

  const paymentMethods = [
    {
      id: 0,
      label: "Cash On Hand",
      value: "Cash On Hand",
    },
    {
      id: 1,
      label: "GCash",
      value: "GCash",
    },
    {
      id: 2,
      label: "Debit Or Credit",
      value: "Debit Or Credit",
    },
  ];

  useEffect(() => {
    const getSitters = async () => {
      try {
        const docRef = collection(db, "sitter");
        const docSnap = await getDocs(docRef);

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
  }, []);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const fetched = await fetchUserData();

        setUserData(fetched);
      } catch (error) {
        console.error(error);
      }
    };
    getUserData();
  }, []);

  useEffect(() => {
    const getFeedbackAndRate = async () => {
      try {
        const docRef = collection(db, "requester");
        const q = query(
          docRef,
          where("sitting_service_provider_id", "==", chosenSitter?.id || "")
        );
        const docSnap = await getDocs(q);

        const result = docSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setFeedbackRate(result);
      } catch (error) {
        console.error(error);
      }
    };
    getFeedbackAndRate();
  }, [chosenSitter]);

  const listOfHolidays = [
    { key: 0, date: "January 1" },
    { key: 1, date: "December 24" },
    { key: 2, date: "April 1" },
    { key: 3, date: "April 9" },
    { key: 4, date: "April 17" },
    { key: 5, date: "April 18" },
    { key: 6, date: "May 1" },
    { key: 7, date: "June 12" },
    { key: 8, date: "August 25" },
    { key: 9, date: "November 30" },
    { key: 10, date: "December 25" },
    { key: 11, date: "December 30" },
    { key: 12, date: "January 29" },
    { key: 13, date: "April 19" },
    { key: 14, date: "August 21" },
    { key: 15, date: "October 31" },
    { key: 16, date: "November 1" },
    { key: 17, date: "December 8" },
    { key: 18, date: "December 31" },
  ];

  const HolidayBonusCalculator = () => {
    if (dateStart && dateEnd && dateStart.isBefore(dateEnd)) {
      const year = dateStart.year();
      const holidays = getHolidayDates(year);
      let current = dateStart.startOf("day");

      while (current.isBefore(dateEnd) || current.isSame(dateEnd, "day")) {
        if (holidays.some((h) => h.isSame(current, "day"))) {
        }
        current = current.add(1, "day");
      }
      const bonus = petSitOffer.price * 0.2;
      const totalPrice = bonus + petSitOffer.price;

      const day = dateEnd.startOf("day").diff(dateStart.startOf("day"), "day");

      setPetSitOffer({
        ...petSitOffer,
        totalPrice: Math.trunc(totalPrice),
        day: day,
      });
    } else {
      setPetSitOffer({ ...petSitOffer, totalPrice: petSitOffer.price });
    }
  };

  const getHolidayDates = (year: number): Dayjs[] => {
    return listOfHolidays.map((holiday) =>
      dayjs(`${holiday.date} ${year}`, "MMMM DD, YYYY")
    );
  };

  const offerHandle = async () => {
    try {
      const docRef = collection(db, "offer");

      const addSittingService = await addDoc(docRef, {
        sitting_service_createdAt: Timestamp.now(),
        sitting_service_requester_name: userData[0]?.User_Name,
        sitting_service_requester_id: userData[0]?.User_UID,
        sitting_service_requester_email: userData[0]?.User_Email,
        sitting_service_price: petSitOffer?.totalPrice,
        sitting_service_address: petSitOffer?.address,
        sitting_service_startDate: dateStart
          ? Timestamp.fromDate(dateStart?.toDate())
          : null,
        sitting_service_endDate: dateEnd
          ? Timestamp.fromDate(dateEnd?.toDate())
          : null,
        sitting_service_payment_type: petSitOffer?.typeOfPayment,
        sitting_service_status: "pending",
      });

      if (addSittingService) {
        setSuccessful(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (successful) {
    setInterval(() => {
      setSuccessful(false);
      router.push(`/Profile/${userData[0]?.User_UID}`);
    }, 1500);
    return (
      <div className="h-screen ">
        <div className="flex flex-row items-center justify-center mt-32 gap-4 animate-bounce ease-in-out transform-gpu duration-1000">
          <div className=" h-24 w-24 bg-white rounded-full flex items-center justify-center p-1">
            <div className="h-full w-full rounded-full bg-[#25CA85] flex items-center justify-center flex-row">
              <FontAwesomeIcon icon={faCheck} className="text-white h-14" />{" "}
            </div>
          </div>
          <h1 className="font-montserrat font-bold text-3xl">Succeful!</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <nav className="relative z-20">
        <ClientNavbar />
      </nav>
      <div className="mx-52 flex flex-row justify-between">
        <h1 className=" font-montserrat font-bold text-2xl text-[#393939] my-8">
          List Of Pet Sitter
        </h1>
        <button
          onClick={() => setAddPostModal(true)}
          className="active:scale-95 font-montserrat font-bold text-lg py-2 px-5 rounded-full text-white my-8 bg-[#006B95]"
        >
          Add Post Sitter Request
          <FontAwesomeIcon icon={faPlus} className="ml-4 " />
        </button>
      </div>
      <div className="mx-52 grid grid-cols-2 h-full mb-4 gap-3">
        <div className="bg-white h-full grid grid-rows-4 drop-shadow-md rounded-md border-2 mb-4 p-2">
          {sitter.map((data, index) => {
            return (
              <div
                className="h-full grid grid-cols-6 border-[2px] border-slate-300 rounded-lg pr-2 text-ellipsis overflow-hidden cursor-pointer"
                key={index}
                onClick={() => setChosenSitter(data)}
              >
                <div className=" m-auto h-10 w-10 rounded-full border-slate-300 border-[1px] flex items-center justify-center font-montserrat font-bold text-2xl">
                  <h1 className="capitalize">
                    {data?.sitter_fullname?.charAt(0)}
                  </h1>
                </div>
                <div className="my-auto col-span-3  flex flex-col gap-1">
                  <h1 className="capitalize text-nowrap overflow-hidden text-ellipsis font-hind  ">
                    Pet Sitter Name:{" "}
                    <span className="font-bold font-montserrat text-lg text-[#006B95]">
                      {data?.sitter_fullname}
                    </span>
                  </h1>
                  <h1 className="font-hind text-nowrap  overflow-hidden text-ellipsis">
                    Email:{" "}
                    <span className="font-semibold font-montserrat  text-[#006B95]">
                      {data?.sitter_email}
                    </span>
                  </h1>
                  <h1 className="font-hind text-nowrap overflow-hidden text-ellipsis">
                    Contact:{" "}
                    <span className="font-montserrat font-bold text-[lg] text-[#006B95] text-nowrap ">
                      +63 {data?.sitter_contact}
                    </span>
                  </h1>
                </div>
                {data?.sitter_total_rating && (
                  <Rate
                    value={data?.sitter_total_rating}
                    disabled
                    className="m-auto col-span-2"
                  />
                )}
              </div>
            );
          })}
        </div>
        <div className="flex-grow bg-white drop-shadow-md rounded-md border-[2px] border-slate-300 overflow-hidden pb-2">
          {chosenSitter && (
            <div className="flex justify-end w-full">
              <Link
                href={`/Profile/Sitter/${chosenSitter?.id}`}
                className="italic font-hind underline text-[#006B95] font-semibold"
              >
                View Pet Sitter Profile
              </Link>
            </div>
          )}
          <div className="flex flex-row justify-between p-4">
            {chosenSitter && (
              <h1 className="capitalize text-lg text-[#393939] font-montserrat font-bold">
                Name: {chosenSitter?.sitter_fullname}
              </h1>
            )}
            {chosenSitter && (
              <Rate value={chosenSitter?.sitter_total_rating} disabled />
            )}
          </div>
          {chosenSitter && (
            <div className="h-full flex flex-col  mx-2">
              <div className="bg-white rounded-xl h-44 drop-shadow-md flex items-center justify-center mb-2">
                <a
                  href={`https://www.google.com/maps?q=${encodeURIComponent(
                    chosenSitter?.sitter_address || ""
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-montserrat text-center font-bold text-sm px-4 w-fit text-white bg-blue-800 rounded-full py-3 block active:scale-95"
                >
                  {chosenSitter?.sitter_address}
                </a>
              </div>
              <div className="grid grid-rows-3 overflow-y-scroll py-2 flex-grow">
                {feedbackRate?.map((data, index) => {
                  return (
                    <div
                      key={index}
                      className="h-full grid grid-cols-5 overflow-hidden text-ellipsis border-[2px] rounded-lg pt-1 border-slate-300"
                    >
                      <div className="h-12 w-12 rounded-full flex items-center m-auto justify-center capitalize font-montserrat font-bold text-xl  border-slate-300 border-[1px] ">
                        {data?.sitting_service_requester_name?.charAt(0)}
                      </div>
                      <div className="col-span-4">
                        <h1 className="font-hind">
                          Rated by:{" "}
                          <span className="font-montserrat font-bold text-[#006B95] capitalize ml-2">
                            {data?.sitting_service_requester_name}
                          </span>
                        </h1>
                        <Rate
                          value={data?.sitting_service_feedback_and_rate?.rate}
                          disabled
                        />
                        <p className="mt-2 overflow-hidden text-ellipsis">
                          {data?.sitting_service_feedback_and_rate?.feedback}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      <Modal
        open={addPostModal}
        onCancel={() => setAddPostModal(false)}
        onClose={() => setAddPostModal(false)}
        onOk={() => {
          HolidayBonusCalculator();
          setAddPostModal(false);
          setConfirmPetSitModal(true);
        }}
        centered
      >
        <h1 className="font-hind font-medium text-[#393939] text-base">
          Please input offer information
        </h1>
        <div className="grid grid-cols-2 mx-7 items-center gap-2 my-4">
          <label htmlFor="price-id" className="font-montserrat font-semibold">
            Your Offer:{" "}
          </label>
          <input
            type="number"
            name="price"
            id="price-id"
            placeholder="Php."
            value={petSitOffer.price == 0 ? "" : petSitOffer.price}
            onChange={(e) =>
              setPetSitOffer({ ...petSitOffer, price: Number(e.target.value) })
            }
            className="h-9 w-full rounded-md border-[1px] border-slate-300 outline-none [&::-webkit-inner-spin-button]:appearance-none px-2 font-hind"
          />
          <label htmlFor="address-id" className="font-montserrat font-semibold">
            Address:{" "}
          </label>
          <input
            type="text"
            name="address"
            id="address-id"
            placeholder="Proper Address"
            value={petSitOffer.address}
            onChange={(e) =>
              setPetSitOffer({ ...petSitOffer, address: e.target.value })
            }
            className="h-9 w-full rounded-md border-[1px] border-slate-300 outline-none px-2 font-hind"
          />
          <label htmlFor="start-id" className="font-montserrat font-semibold">
            Date when to pet sit
          </label>
          <DatePicker
            format={"MMMM DD, YYYY - hh:mm A"}
            id="start-id"
            onChange={(date: dayjs.Dayjs | null) => setDateStart(date)}
            showTime
          />
          <label htmlFor="end-id" className="font-montserrat font-semibold">
            Date when to end
          </label>
          <DatePicker
            format={"MMMM DD, YYYY - hh:mm A"}
            id="end-id"
            showTime
            onChange={(date: dayjs.Dayjs | null) => setDateEnd(date)}
          />
          <label htmlFor="payment-id">Type Of Payment: </label>
          <div
            id="payment-id"
            ref={dropDownPaymentRef}
            onClick={() => setDropdownPayments((prev) => !prev)}
            className="cursor-pointer relative h-8 flex flex-col justify-center rounded-lg font-hind text-[#393939] border-[1px] border-slate-300 outline-none px-2 placeholder:font-hind"
          >
            <h1 className="font-montserrat capitalize">
              {petSitOffer?.typeOfPayment
                ? `${petSitOffer?.typeOfPayment}`
                : ``}
            </h1>
            <div
              className={`${
                dropdownPayments ? `flex flex-col gap-2` : `hidden`
              } bg-white drop-shadow-md rounded-md absolute w-full z-20 left-0 top-8 p-4 `}
            >
              {paymentMethods.map((data, index) => {
                return (
                  <h1
                    key={index}
                    onClick={() =>
                      setPetSitOffer({
                        ...petSitOffer,
                        typeOfPayment: data.value,
                      })
                    }
                    className="capitalize border-[1px] border-slate-300 rounded-md p-4"
                  >
                    {data.label}
                  </h1>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        open={confirmPetSitModal}
        onCancel={() => setConfirmPetSitModal(false)}
        onClose={() => setConfirmPetSitModal(false)}
        onOk={() => {
          offerHandle();
          setConfirmPetSitModal(false);
        }}
        centered
      >
        <div className="grid grid-cols-2 gap-2">
          <h1 className="font-montserrat font-medium">Offer: </h1>
          <span className="font-montserrat font-bold text-[#006B95]">
            Php {petSitOffer?.price}
          </span>
          <h1 className="font-montserrat font-medium">Address:</h1>
          <span className="font-montserrat font-bold text-[#006B95]">
            {petSitOffer?.address}
          </span>
          <h1 className="font-montserrat font-medium">Date Start: </h1>
          <span className="font-montserrat font-bold text-[#006B95]">
            {dateStart?.format("MMMM DD, YYYY hh:mm A")}
          </span>
          <h1 className="font-montserrat font-medium">Date End: </h1>
          <span className="font-montserrat font-bold text-[#006B95]">
            {dateEnd?.format("MMMM DD, YYYY hh:mm A")}
          </span>
          <h1 className="font-montserrat font-medium">Total Price: </h1>
          <span className="font-montserrat font-bold text-[#006B95]">
            Php {petSitOffer?.totalPrice}
          </span>
          <h1 className="font-montserrat font-medium">Days: </h1>
          <span className="font-montserrat font-bold text-[#006B95]">
            {petSitOffer.day}
          </span>
          <h1 className="font-montserrat font-medium">Type Of Payment:</h1>
          <p className="font-montserrat font-bold text-[#006B95]">
            {petSitOffer?.typeOfPayment}
          </p>
        </div>
      </Modal>
    </div>
  );
}
