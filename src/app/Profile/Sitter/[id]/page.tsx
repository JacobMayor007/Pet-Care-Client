"use client";

import ClientNavbar from "@/app/ClientNavbar/page";
import { db } from "@/app/firebase/config";
import {
  faArrowLeft,
  faCheck,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DatePicker, Modal, Rate } from "antd";
import dayjs, { Dayjs } from "dayjs";
import {
  addDoc,
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import "@ant-design/v5-patch-for-react-19";
import fetchUserData from "@/app/fetchData/fetchUserData";

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
  sitter_address?: string;
}

interface SitterID {
  params: Promise<{ id: string }>;
}

interface FeedbackAndRate {
  id?: string;
  sitting_service_feedback_and_rate?: {
    rate?: number;
    feedback?: string;
  };
  sitting_service_requester_name?: string;
}

export default function Sitter({ params }: SitterID) {
  const { id } = React.use(params);
  const dropDownPaymentRef = useRef<HTMLDivElement | null>(null);
  const [userData, setUserData] = useState<DocumentData[]>([]);
  const [sitter, setSitter] = useState<Sitters | null>(null);
  const [petSitModal, setPetSitModal] = useState(false);
  const [dateStart, setDateStart] = useState<Dayjs | null>(null);
  const [dateEnd, setDateEnd] = useState<Dayjs | null>(null);
  const [confirmPetSitModal, setConfirmPetSitModal] = useState(false);
  const [successful, setSuccessful] = useState(false);
  const [dropdownServices, setDropdownServices] = useState(false);
  const [dropdownPayments, setDropdownPayments] = useState(false);
  const [feedbackRate, setFeedbackRate] = useState<FeedbackAndRate[]>([]);

  const [petSitOffer, setPetSitOffer] = useState({
    price: 0,
    address: "",
    totalPrice: 0,
    day: 0,
    typeOfPayment: "",
  });

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

  // Converts the holiday list to Dayjs objects for a given year
  const getHolidayDates = (year: number): Dayjs[] => {
    return listOfHolidays.map((holiday) =>
      dayjs(`${holiday.date} ${year}`, "MMMM DD, YYYY")
    );
  };

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

  useEffect(() => {
    const closeNotification = (e: MouseEvent) => {
      if (!dropDownPaymentRef.current?.contains(e.target as Node)) {
        setDropdownServices(false);
      }
    };

    document.body.addEventListener("mousedown", closeNotification);

    return () => {
      document.body.removeEventListener("mouseover", closeNotification);
    };
  }, [dropdownServices]);

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
    const getSitters = async () => {
      try {
        const docRef = doc(db, "sitter", id);
        const docSnap = await getDoc(docRef);

        const result = { id: docSnap.id, ...docSnap.data() } as Sitters;

        setSitter(result);
      } catch (error) {
        console.error(error);
        return [];
      }
    };

    getSitters();
  }, [id]);

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

  const offerHandle = async () => {
    try {
      const docRef = collection(db, "requester");
      const q = query(
        docRef,
        where(
          "sitting_service_requester_id",
          "==",
          userData[0]?.User_UID || ""
        ),
        where("sitting_service_provider_id", "==", id)
      );
      const querySnapshot = await getDocs(q);
      const isNewCustomer = querySnapshot.empty;
      const sitterReqRef = collection(db, "notifications");

      const addSittingService = await addDoc(docRef, {
        sitting_service_createdAt: Timestamp.now(),
        sitting_service_requester_name: userData[0]?.User_Name,
        sitting_service_requester_id: userData[0]?.User_UID,
        sitting_service_requester_email: userData[0]?.User_Email,
        sitting_service_provider_name: sitter?.sitter_fullname,
        sitting_service_provider_email: sitter?.sitter_email,
        sitting_service_provider_id: sitter?.sitter_uid,
        sitting_service_price: petSitOffer?.totalPrice,
        sitting_service_address: petSitOffer?.address,
        sitting_service_isNewCustomer: isNewCustomer,
        sitting_service_startDate: dateStart
          ? Timestamp.fromDate(dateStart?.toDate())
          : null,
        sitting_service_endDate: dateEnd
          ? Timestamp.fromDate(dateEnd?.toDate())
          : null,
        sitting_service_payment_type: petSitOffer?.typeOfPayment,
        sitting_service_status: "pending",
      });

      const addSitterReqRef = await addDoc(sitterReqRef, {
        createdAt: Timestamp.now(),
        sitter_id: addSittingService.id,
        receiverID: id,
        senderID: userData[0]?.User_UID,
        receiver_fullName: sitter?.sitter_fullname,
        sender_fullname: userData[0]?.User_Name,
        message: `${
          userData[0]?.User_Name
        } have a request to you to pet sit on ${dateStart?.format(
          "MMMM DD, YYYY - hh:mm A"
        )} till ${dateEnd?.format("MMMM DD, YYYY - hh:mm A")}`,
        open: false,
        status: "unread",
        hide: false,
        title: "sitting",
      });

      console.log(addSitterReqRef);

      if (addSittingService) {
        setSuccessful(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const getFeedbackAndRate = async () => {
      try {
        const docRef = collection(db, "requester");
        const q = query(docRef, where("sitting_service_provider_id", "==", id));
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
  }, [id]);

  if (successful) {
    setInterval(() => {
      setSuccessful(false);
    }, 1500);
    return (
      <div className="h-screen">
        <div className="flex flex-row items-center justify-center mt-32 gap-4">
          <div className=" h-24 w-24 bg-white rounded-full flex items-center justify-center p-1">
            <div className="h-full w-full rounded-full bg-[#25CA85] flex items-center justify-center flex-row">
              <FontAwesomeIcon icon={faCheck} className="text-white h-14" />{" "}
            </div>
          </div>
          <h1 className="font-montserrat font-bold text-3xl">
            Offer Request Is Succeful!
          </h1>
        </div>
      </div>
    );
  }

  console.log(feedbackRate);

  return (
    <div>
      <nav className="relative z-30">
        <ClientNavbar />
      </nav>
      <h1 className="mx-56 flex flex-row items-center gap-4 text-3xl font-montserrat font-bold mt-10 mb-8">
        <FontAwesomeIcon
          icon={faArrowLeft}
          onClick={() => history.back()}
          className="cursor-pointer"
        />
        Sitter&lsquo;s Profile
      </h1>

      <div className="mx-56 grid grid-cols-5 items-center">
        <div className="h-40 w-40 rounded-full border-[1px] capitalize font-montserrat font-bold text-[#393939] text-3xl drop-shadow-md bg-white border-slate-300 flex justify-center items-center">
          {sitter?.sitter_fullname?.charAt(0)}
        </div>
        <div className="col-span-4 relative">
          <h1 className="capitalize font-montserrat font-bold text-3xl">
            {sitter?.sitter_fullname}
          </h1>
          <h1 className="font-hind text-lg text-[#393939] mt-1">
            {sitter?.sitter_email}
          </h1>
          <div className="h-0.5 w-3/4 bg-slate-400 my-2" />
          <h1 className="mb-1 font-montserrat ">
            Contact: {sitter?.sitter_contact}
          </h1>
          <h1 className="font-montserrat">Address: {sitter?.sitter_address}</h1>
          <h1
            onClick={() => setPetSitModal(true)}
            className={`absolute right-10 -top-10 h-12 font-montserrat capitalize font-bold text-4xl flex justify-between`}
          >
            <span className="text-lg flex items-center gap-2 px-4 rounded-full cursor-pointer bg-green-500 text-white">
              Offer to Pet Sit <FontAwesomeIcon icon={faCircleCheck} />{" "}
            </span>
          </h1>
        </div>
        <div className="col-span-5 my-16">
          <h1 className="font-montserrat font-bold text-2xl">About</h1>
        </div>
        <div className="col-span-2  my-8">
          <h1 className="font-montserrat font-bold text-2xl">
            Available Days:
          </h1>
          <span className="grid grid-cols-3 items-start h-32 mr-4 drop-shadow-md bg-white p-4 py-6 rounded-md">
            {sitter?.sitter_working_days?.map((day, dayIndex) => {
              const weekDay = weeks.find((week) => week.key === day)?.label;
              return (
                <span key={dayIndex} className="text-center">
                  {weekDay}
                </span>
              );
            })}
          </span>
        </div>
        {sitter?.sitter_isExperience && (
          <h1 className="font-montserrat font-bold text-2xl">
            Have prior experience gained outside of this website.{" "}
          </h1>
        )}
        {sitter?.sitter_isOkayOnHoliday && (
          <h1 className="font-montserrat font-bold text-2xl col-span-5 text-[#005B95] italic underline">
            Can work even on holidays
          </h1>
        )}
      </div>

      <h1 className="font-montserrat font-bold text-2xl mx-56 mt-10 mb-8">
        Feedback and Rate
      </h1>
      <div className="mx-56 flex flex-col mb-8 gap-5">
        {feedbackRate?.map((data, index) => {
          return (
            <div
              className="bg-white rounded-lg p-4 drop-shadow-md border-slate-300 border-[1px] h-48 grid grid-cols-12"
              key={index}
            >
              <div className="h-12 w-12 rounded-full border-slate-300 flex items-center justify-center capitalize font-montserrat font-bold text-2xl border-[1px]  mx-auto">
                {data?.sitting_service_requester_name?.charAt(0)}
              </div>
              <div className="col-span-11 flex flex-col ">
                <h1>
                  Name:{" "}
                  <span className="font-montserrat font-bold text-lg text-[#006B95] capitalize">
                    {data?.sitting_service_requester_name}
                  </span>
                </h1>
                <h1 className="font-hind text-[#393939] text-lg">
                  Rate:{" "}
                  <span>
                    <Rate
                      value={data?.sitting_service_feedback_and_rate?.rate}
                      disabled
                    />
                  </span>
                </h1>
                <div className="h-0.5 w-full bg-slate-300 rounded-full" />
                <div className="mt-2 font-hind text-[#393939] text-base">
                  {data?.sitting_service_feedback_and_rate?.feedback}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        centered
        open={petSitModal}
        onCancel={() => setPetSitModal(false)}
        onClose={() => setPetSitModal(false)}
        onOk={() => {
          HolidayBonusCalculator();
          setPetSitModal(false);
          setConfirmPetSitModal(true);
        }}
      >
        <h1 className="font-hind text-base">
          Input your offer for{" "}
          <span className="font-montserrat font-bold text-[#006B95] capitalize ">
            {sitter?.sitter_fullname}
          </span>
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
              {sitter?.sitter_type_of_payments?.map((data, index) => {
                return (
                  <h1
                    key={index}
                    onClick={() =>
                      setPetSitOffer({
                        ...petSitOffer,
                        typeOfPayment: data,
                      })
                    }
                    className="capitalize border-[1px] border-slate-300 rounded-md p-4"
                  >
                    {data}
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
