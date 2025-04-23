"use client";

import ClientNavbar from "@/app/ClientNavbar/page";
import fetchUserData from "@/app/fetchData/fetchUserData";
import { db } from "@/app/firebase/config";
import {
  faArrowLeft,
  faCheck,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DatePicker, Modal, Rate } from "antd";
import "@ant-design/v5-patch-for-react-19";
import dayjs, { Dayjs } from "dayjs";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import Loading from "@/app/Loading/page";

interface MemorialId {
  params: Promise<{ id: string }>;
}

interface Mourners {
  id?: string;
  memorial_service_rate_and_feedback?: {
    feedback?: string;
    rate?: number;
  };
  memorial_service_mourner_name?: string;
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
  mortician_memorial_working_days?: number[];
  mortician_uid?: string;
}

export default function ViewMemorial({ params }: MemorialId) {
  const dropDownRef = useRef<HTMLDivElement | null>(null);
  const dropDownPaymentRef = useRef<HTMLDivElement | null>(null);
  const [feedbackRate, setFeedbackRate] = useState<Mourners[]>([]);
  const { id } = React.use(params);
  const [dateModal, setDateModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userUID, setUserUID] = useState("");
  const [userFullName, setUserFullName] = useState("");
  const [memorial, setMemorial] = useState<Memorial>();
  const [dropdownServices, setDropdownServices] = useState(false);
  const [dropdownPayments, setDropdownPayments] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [date, setDate] = useState<Dayjs | null>(null);
  const [loading, setLoading] = useState(false);
  const [successful, setSuccessful] = useState(false);
  const [memorialFormData, setMemorialFormData] = useState({
    selectedServices: "",
    petName: "",
    typeOfPayment: "",
    contact: "",
  });

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
    const getThisMemorialProvider = async () => {
      try {
        const memorialRef = doc(db, "memorial", id);
        const docSnap = await getDoc(memorialRef);

        if (docSnap.exists()) {
          const result = { id: docSnap.id, ...docSnap.data() } as Memorial;
          setMemorial(result);
        }
      } catch (error) {
        console.error(error);
      }
    };

    getThisMemorialProvider();
  }, [id]);

  useEffect(() => {
    const getFeedbackAndRate = async () => {
      try {
        const docRef = collection(db, "mourners");
        const q = query(
          docRef,
          where("memorial_service_provider_id", "==", id),
          where("memorial_service_status", "==", "Paid"),
          where("memorial_service_rate_and_feedback.rate", "!=", null)
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
  }, [id]);

  useEffect(() => {
    const getUserData = async () => {
      const result = await fetchUserData();
      setUserEmail(result[0]?.User_Email);
      setUserUID(result[0]?.User_UID);
      setUserFullName(result[0]?.User_Name);
    };
    getUserData();
  }, []);

  useEffect(() => {
    const closeNotification = (e: MouseEvent) => {
      if (!dropDownRef.current?.contains(e.target as Node)) {
        setDropdownServices(false);
      }
    };

    document.body.addEventListener("mousedown", closeNotification);

    return () => {
      document.body.removeEventListener("mouseover", closeNotification);
    };
  }, [dropdownServices]);

  useEffect(() => {
    const closeNotification = (e: MouseEvent) => {
      if (!dropDownPaymentRef.current?.contains(e.target as Node)) {
        setDropdownPayments(false);
      }
    };

    document.body.addEventListener("mousedown", closeNotification);

    return () => {
      document.body.removeEventListener("mouseover", closeNotification);
    };
  }, [dropdownPayments]);

  const confirmMemorial = async () => {
    setConfirmModal(false);
    setLoading(true);
    try {
      const docRef = collection(db, "mourners");
      const q = query(
        docRef,
        where("memorial_service_mourner_id", "==", userUID),
        where("memorial_service_provider_id", "==", id)
      );
      const querySnapshot = await getDocs(q);
      const isNewCustomer = querySnapshot.empty;
      const memorialNotifRef = collection(db, "notifications");

      const addMemorial = await addDoc(docRef, {
        memorial_service_mourner_id: userUID,
        memorial_service_mourner_email: userEmail,
        memorial_service_mourner_name: userFullName,
        memorial_service_petName: memorialFormData?.petName,
        memorial_service_date: date ? Timestamp.fromDate(date.toDate()) : null,
        memorial_service_type: memorialFormData?.selectedServices,
        memorial_service_provider_id: id,
        memorial_service_status: "isPending",
        memorial_service_provider_email: memorial?.mortician_email,
        memorial_service_provider_contact: memorial?.mortician_contact,
        memorial_service_provider_fullname: memorial?.mortician_fullname,
        memorial_service_provider_address: memorial?.mortician_memorial_address,
        memorial_service_provider_memorial_name:
          memorial?.mortician_memorial_name,
        memorial_service_isNewCustomer: isNewCustomer,
        memorial_service_payment: memorialFormData?.typeOfPayment,
        memorial_service_createdAt: Timestamp.now(),
      });

      const addMemorialNotif = await addDoc(memorialNotifRef, {
        createdAt: Timestamp.now(),
        memorial_id: addMemorial.id,
        receiverID: id,
        senderID: userUID,
        receiver_fullName: memorial?.mortician_fullname,
        sender_fullname: userFullName,
        message: `${userFullName} wants to have memorial on ${date?.format(
          "MMMM DD, YYYY"
        )}`,
        open: false,
        status: "unread",
        hide: false,
        title: "memorial",
      });

      if (addMemorial && addMemorialNotif) {
        setSuccessful(true);
        setLoading(false);
      }

      console.log("Adding Memorial Appointment Successful!", addMemorial);
      console.log(
        "Adding Notification Memorial Successfull!",
        addMemorialNotif
      );
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (successful) {
    setInterval(() => {
      setSuccessful(false);
    }, 3000);
    return (
      <div className="h-screen">
        <div className="flex flex-row items-center justify-center mt-32 gap-4">
          <div className=" h-24 w-24 bg-white rounded-full flex items-center justify-center p-1">
            <div className="h-full w-full rounded-full bg-[#25CA85] flex items-center justify-center flex-row">
              <FontAwesomeIcon icon={faCheck} className="text-white h-14" />{" "}
            </div>
          </div>
          <h1 className="font-montserrat font-bold text-3xl">
            Booking Memorial Is Succeful!
          </h1>
        </div>
      </div>
    );
  }

  console.log(feedbackRate);

  return (
    <div>
      <nav className="relative z-20">
        <ClientNavbar />
      </nav>
      <div className="grid grid-cols-5 mx-56">
        <h1 className="col-span-5 flex flex-row gap-4 items-center font-montserrat font-bold text-[#393939] text-3xl my-8">
          <FontAwesomeIcon
            icon={faArrowLeft}
            className="cursor-pointer"
            onClick={() => {
              history.back();
            }}
          />
          Memorial&#39;s Profile
        </h1>

        <div className="h-40 w-40 rounded-full border-[1px] capitalize font-montserrat font-bold text-[#393939] text-3xl drop-shadow-md bg-white border-slate-300 flex justify-center items-center">
          {memorial?.mortician_fullname?.charAt(0)}
        </div>
        <div className="col-span-4 relative">
          <h1 className="capitalize font-montserrat font-bold text-3xl">
            {memorial?.mortician_fullname}
          </h1>
          <h1 className="font-hind text-lg text-[#393939] mt-1">
            {memorial?.mortician_email}
          </h1>
          <div className="h-0.5 w-3/4 bg-slate-400 my-2" />
          <h1 className="mb-1 font-montserrat">
            Memorial Name: {memorial?.mortician_memorial_name}
          </h1>
          <h1 className="mb-1  font-montserrat ">
            Location: {memorial?.mortician_memorial_address}
          </h1>
          <h1 className="mb-1 font-montserrat ">
            Contact: {memorial?.mortician_contact}
          </h1>
        </div>
        <div className="col-span-5 my-16">
          <h1 className="font-montserrat font-bold text-2xl">About</h1>
        </div>
        <div className="col-span-5 my-8">
          <h1 className="font-montserrat font-bold text-2xl">Services</h1>
          {memorial?.morticial_memorial_services?.map((data, index) => {
            return (
              <h1
                key={index}
                className="font-montserrat capitalize text-xl my-4"
              >
                {data}
              </h1>
            );
          })}
        </div>
        <div className="col-span-2  my-8">
          <h1 className="font-montserrat font-bold text-2xl">
            Available Days:
          </h1>
          <span className="grid grid-cols-3 items-start h-32 mr-4 drop-shadow-md bg-white p-4 py-6 rounded-md">
            {memorial?.mortician_memorial_working_days?.map((day, dayIndex) => {
              const weekDay = weeks.find((week) => week.key === day)?.label;
              return (
                <span key={dayIndex} className="text-center">
                  {weekDay}
                </span>
              );
            })}
          </span>
        </div>
        <div
          className={`font-montserrat capitalize font-bold text-4xl mt-4 mb-10 flex gap-10 flex-row items-center col-span-5`}
        >
          <h1>
            <span
              className="text-lg flex items-center gap-2 px-4 rounded-full cursor-pointer py-3 bg-green-500 text-white"
              onClick={() => setDateModal(true)}
            >
              Book A Memorial Appointment{" "}
              <FontAwesomeIcon icon={faCircleCheck} />{" "}
            </span>
          </h1>
        </div>
      </div>
      <h1 className="font-montserrat font-bold text-2xl mx-56 mb-8">
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
                {data?.memorial_service_mourner_name?.charAt(0)}
              </div>
              <div className="col-span-11 flex flex-col ">
                <h1>
                  Name:{" "}
                  <span className="font-montserrat font-bold text-lg text-[#006B95] capitalize">
                    {data?.memorial_service_mourner_name}
                  </span>
                </h1>
                <h1 className="font-hind text-[#393939] text-lg">
                  Rate:{" "}
                  <span>
                    <Rate
                      value={data?.memorial_service_rate_and_feedback?.rate}
                      disabled
                    />
                  </span>
                </h1>
                <div className="h-0.5 w-full bg-slate-300 rounded-full" />
                <div className="mt-2 font-hind text-[#393939] text-base">
                  {data?.memorial_service_rate_and_feedback?.feedback}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Modal
        open={dateModal}
        centered
        onCancel={() => setDateModal(false)}
        onClose={() => setDateModal(false)}
        onOk={() => {
          if (
            !date ||
            !memorialFormData?.petName ||
            !memorialFormData?.selectedServices
          ) {
            alert("Input all fields");
            return;
          }
          setConfirmModal(true);
          setDateModal(false);
        }}
      >
        <h1 className="font-montserrat font-bold text-[#393939 text-xl mb-7">
          Memorial Information
        </h1>
        <div className=" grid grid-cols-2 gap-2 mx-6">
          <label htmlFor="date-id">When is the memorial?</label>
          <DatePicker
            id="date-id"
            disabledDate={(current) =>
              !memorial?.mortician_memorial_working_days?.includes(
                current.day()
              )
            }
            onChange={(date: dayjs.Dayjs | null) => setDate(date)}
            format={"MMMM DD, YYYY"}
          />
          <label htmlFor="pet-name-id">Name of your pet?</label>
          <input
            type="text"
            name="pet-name"
            id="pet-name-id"
            onChange={(e) =>
              setMemorialFormData({
                ...memorialFormData,
                petName: e.target.value,
              })
            }
            className="h-8 rounded-lg font-hind text-[#393939] border-[1px] border-slate-300 outline-none px-2 placeholder:font-hind"
          />
          <label htmlFor="contact-id">Contact: </label>

          <div className="h-9 w-full outline-none rounded-md font-hind text-base px-2 border-[1px] border-slate-300 flex flex-row items-center">
            <p className="border-[1px] border-slate-300 rounded-sm p-0.5 mr-2">
              +63
            </p>
            <input
              type="number"
              name="contact"
              id="contact-id"
              onKeyDown={(event) => {
                if (
                  event.key == "." ||
                  event.key === "-" ||
                  event.key === "e"
                ) {
                  event.preventDefault();
                }
              }}
              className=" w-full h-full outline-none [&::-webkit-inner-spin-button]:appearance-none"
              value={memorialFormData.contact}
              onChange={(e) => {
                const inputValue = e.target.value;
                if (inputValue.length <= 10) {
                  setMemorialFormData({
                    ...memorialFormData,
                    contact: inputValue,
                  });
                }
                if (inputValue.charAt(0) !== "9") {
                  setMemorialFormData({
                    ...memorialFormData,
                    contact: inputValue.slice(0, 0),
                  });
                } else {
                  setMemorialFormData({
                    ...memorialFormData,
                    contact: inputValue.slice(0, 10),
                  });
                }
              }}
            />
          </div>

          <label htmlFor="service-id">Type Of Service</label>
          <div
            id="service-id"
            ref={dropDownRef}
            onClick={() => setDropdownServices((prev) => !prev)}
            className="cursor-pointer relative h-8 flex flex-col justify-center rounded-lg font-hind text-[#393939] border-[1px] border-slate-300 outline-none px-2 placeholder:font-hind"
          >
            <h1 className="font-montserrat capitalize">
              {memorialFormData?.selectedServices
                ? `${memorialFormData?.selectedServices + " " + "Ceremony"}`
                : ``}
            </h1>
            <div
              className={`${
                dropdownServices ? `flex flex-col gap-2` : `hidden`
              } bg-white drop-shadow-md rounded-md absolute w-full z-20 left-0 top-8 p-4 `}
            >
              {memorial?.morticial_memorial_services?.map((data, index) => {
                return (
                  <h1
                    key={index}
                    onClick={() =>
                      setMemorialFormData({
                        ...memorialFormData,
                        selectedServices: data,
                      })
                    }
                    className="capitalize border-[1px] border-slate-300 rounded-md p-4"
                  >
                    {data} Ceremony
                  </h1>
                );
              })}
            </div>
          </div>
          <label htmlFor="payment-id">Type Of Payment</label>
          <div
            id="payment-id"
            ref={dropDownPaymentRef}
            onClick={() => setDropdownPayments((prev) => !prev)}
            className="cursor-pointer relative h-8 flex flex-col justify-center rounded-lg font-hind text-[#393939] border-[1px] border-slate-300 outline-none px-2 placeholder:font-hind"
          >
            <h1 className="font-montserrat capitalize">
              {memorialFormData?.typeOfPayment
                ? `${memorialFormData?.typeOfPayment}`
                : ``}
            </h1>
            <div
              className={`${
                dropdownPayments ? `flex flex-col gap-2` : `hidden`
              } bg-white drop-shadow-md rounded-md absolute w-full z-20 left-0 top-8 p-4 `}
            >
              {memorial?.mortician_memorial_payments?.map((data, index) => {
                return (
                  <h1
                    key={index}
                    onClick={() =>
                      setMemorialFormData({
                        ...memorialFormData,
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
        centered
        open={confirmModal}
        onCancel={() => setConfirmModal(false)}
        onClose={() => setConfirmModal(false)}
        onOk={confirmMemorial}
      >
        <h1 className="font-montserrat font-bold text-lg">
          Confirmation Of Your Memorial Appointment
        </h1>
        <div className="flex flex-col font-montserrat py-5 gap-2">
          <h1>On: {date?.format("MMMM DD, YYYY")}</h1>
          <h1>Pet Name: {memorialFormData?.petName}</h1>
          <h1 className="capitalize">
            Type Of Service: {memorialFormData?.selectedServices} Ceremony
          </h1>
          <h1 className="capitalize">
            Type Of Payment: {memorialFormData?.typeOfPayment}
          </h1>
        </div>
      </Modal>
    </div>
  );
}
