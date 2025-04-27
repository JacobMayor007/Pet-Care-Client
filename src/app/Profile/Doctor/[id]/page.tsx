"use client";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import ClientNavbar from "@/app/ClientNavbar/page";
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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "@ant-design/v5-patch-for-react-19";
import {
  faArrowLeft,
  faCheck,
  faCircleCheck,
  faEnvelope,
  faMapPin,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
// import { useRouter } from "next/navigation";
import Link from "next/link";
import { DatePicker, Modal, Rate, Select } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { db } from "@/app/firebase/config";
import { getMyPets } from "@/app/Appointments/mypet";
import fetchUserData from "@/app/fetchData/fetchUserData";

interface doctorID {
  params: Promise<{ id: string }>;
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
  doctor_details?: string;
  doctor_available_days?: [];
  doctor_clinicAddress?: string;
  doctor_clinicName?: string;
  doctor_contact?: string;
  doctor_email?: string;
  doctor_experience?: string;
  doctor_license_number?: string;
  doctor_name?: string;
  doctor_pet_types_treated?: [];
  doctor_rating?: number;
  doctor_specialty?: string;
  doctor_standard_fee?: number;
  doctor_sub_specialty?: string;
  doctor_time_in?: string;
  doctor_time_out?: string;
  doctor_title?: string;
  doctor_uid?: string;
}

interface RateAndFeedback {
  id?: string;
  Appointment_PatientFullName?: string;
  Appointment_Rate_Feedback?: {
    feedback?: string;
    rate?: number;
  };
}

interface MyPets {
  id?: string;
  pet_age?: {
    month?: number;
    year?: number;
  };
  pet_breed?: string;
  pet_name?: string;
  pet_ownerEmail?: string;
  pet_ownerName?: string;
  pet_ownerUID?: string;
  pet_sex?: string;
  pet_type?: string;
}

export default function ViewDoctor({ params }: doctorID) {
  const { id } = React.use(params);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      try {
        setLoading(true);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    getUserData();
  }, []);

  if (loading) {
    return (
      <div className="mt-5">
        <LoadingNavbar />
      </div>
    );
  }

  return (
    <div>
      <nav className="relative z-20">
        <ClientNavbar />
      </nav>
      <div className="z-10">
        <DoctorProfile id={id} />
      </div>
    </div>
  );
}

function DoctorProfile(props: { id: string }) {
  const divRef = useRef<HTMLDivElement>(null);

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
  const options = [
    {
      id: 1,
      label: "Cash On Hand",
      img: "./Cash On Hand Image.svg",
    },
    {
      id: 2,
      label: "GCash",
      img: "./GCash Image.svg",
    },
    {
      id: 3,
      label: "Debit Or Credit",
      img: "./Debit Or Credit Image.svg",
    },
  ];

  interface AppointmentStatus {
    id?: string;
    Appointment_Status?: string;
  }

  const [typeOfPayment, setTypeOfPayment] = useState("");
  const [petName, setPetName] = useState("");
  const [petBreed, setPetBreed] = useState("");
  const [petYear, setPetYear] = useState(0);
  const [petMonth, setPetMonth] = useState(0);
  const [petMM, setPetMM] = useState(0);
  const [successful, setSuccessful] = useState(false);
  const [petHg, setPetHg] = useState(0);
  const [rateAndFeedback, setRateAndFeedback] = useState<RateAndFeedback[]>([]);
  const [dateModal, setDateModal] = useState(false);
  const [bookModal, setBookModal] = useState(false);
  const [userData, setUserData] = useState<DocumentData[]>([]);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [myPets, setMyPets] = useState<MyPets[]>([]);
  const [petTypeAnimal, setPetTypeAnimal] = useState("");
  const [userAppointment, setUserAppointment] = useState("");
  const [showAppointments, setShowAppointments] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState<MyPets | null>(null);
  const [doctorSkill, setDoctorSkill] = useState("");
  const [status, setStatus] = useState<AppointmentStatus[]>([]);

  useEffect(() => {
    const closeShowAppointments = (e: MouseEvent) => {
      // Check if the click is outside the divRef element
      if (divRef.current && !divRef.current.contains(e.target as Node)) {
        setShowAppointments(false);
      }
    };

    document.addEventListener("mousedown", closeShowAppointments);

    return () => {
      document.removeEventListener("mousedown", closeShowAppointments);
    };
  }, [showAppointments]);

  useEffect(() => {
    const getUserData = async () => {
      try {
        setLoading(true);
        const fetched = await fetchUserData();

        setUserData(fetched);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    getUserData();
  }, []);

  useEffect(() => {
    const fetchedMyPets = async () => {
      try {
        const getPets = await getMyPets(userData[0]?.User_UID);
        setMyPets(getPets);
      } catch (error) {
        console.error(error);
      }
    };
    fetchedMyPets();
  }, [userData]);

  useEffect(() => {
    const getMyRateAndFeedback = async () => {
      try {
        const docRef = collection(db, "appointments");
        const q = query(docRef, where("Appointment_DoctorUID", "==", props.id));
        const docSnap = await getDocs(q);

        const result = docSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setRateAndFeedback(result);
      } catch (error) {
        console.error(error);
      }
    };
    getMyRateAndFeedback();
  }, [props.id]);

  useEffect(() => {
    const getDoctor = async () => {
      try {
        const docRef = doc(db, "doctor", props.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const result = { id: docSnap.id, ...(docSnap.data() as Doctor) };
          setDoctor(result);
        }
      } catch {
        return [];
      }
    };

    getDoctor();
  }, [props.id]);

  const submitDateAppointment = () => {
    if (!date) {
      alert("Please input fields");
      return;
    } else {
      setBookModal(true);
    }
  };

  useEffect(() => {
    const getMyAppointmentStatus = async () => {
      try {
        const docRef = collection(db, "appointments");
        const q = query(
          docRef,
          where(
            "Appointment_PatientUserUID",
            "==",
            userData[0]?.User_UID || ""
          ),
          where("Appointment_DoctorUID", "==", doctor?.doctor_uid)
        );
        const docSnap = await getDocs(q);

        const result = docSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setStatus(result);
      } catch (error) {
        console.error(error);
      }
    };
    getMyAppointmentStatus();
  }, [userData, doctor]);

  if (loading) {
    return (
      <div className="">
        <LoadingProfile />
      </div>
    );
  }

  const onSubmit = async (id: string) => {
    console.log("On Submit ID: ", id);

    const fullName = userData[0]?.User_Name;

    try {
      setLoading(true);

      if (!date) {
        throw new Error("Appointment date is required.");
      }

      const appointmentDate = Timestamp.fromDate(
        dayjs.isDayjs(date)
          ? date.toDate() // Convert Dayjs to Date
          : new Date(date) // Convert to Date if it's a string
      );

      const patientUserUID = userData[0]?.User_UID || "";
      const docRef = collection(db, "appointments");
      const docNotifRef = collection(db, "notifications");
      const q = query(
        docRef,
        where("Appointment_DoctorUID", "==", doctor?.doctor_uid || ""),
        where("Appointment_PatientUserUID", "==", patientUserUID)
      );
      const querySnapshot = await getDocs(q);

      const isNewPatient = querySnapshot.empty;

      // Add the appointment to Firestore
      const addAppointments = await addDoc(docRef, {
        Appointment_PatientFullName: fullName,
        Appointment_CreatedAt: Timestamp.now(),
        Appointment_PatientUserUID: patientUserUID,
        Appointment_DoctorEmail: doctor?.doctor_email,
        Appointment_DoctorName: doctor?.doctor_name,
        Appointment_TypeOfAppointment: doctorSkill,
        Appointment_Date: appointmentDate,
        Appointment_DoctorUID: doctor?.doctor_uid,
        Appointment_Location: doctor?.doctor_clinicAddress,
        Appointment_DoctorPNumber: doctor?.doctor_contact,
        Appointment_PatientPetAge: {
          Year: selectedPet ? selectedPet?.pet_age?.year : petYear,
          Month: selectedPet ? selectedPet.pet_age?.month : petMonth,
        },
        Appointment_PatientPetBreed: selectedPet
          ? selectedPet?.pet_breed
          : petBreed,
        Appointment_PatientPetName: selectedPet
          ? selectedPet.pet_name
          : petName,
        Appointment_PatientPetBP: {
          Hg: petHg,
          mm: petMM,
        },
        Appointment_PetTypeAnimal: selectedPet
          ? selectedPet?.pet_type
          : petTypeAnimal,
        Appointment_Status: "isPending",
        Appointment_PatientTypeOfPayment: typeOfPayment,
        Appointment_IsNewPatient: isNewPatient,
      });

      const notifAppointments = await addDoc(docNotifRef, {
        appointment_ID: addAppointments.id,
        createdAt: Timestamp.now(),
        receiverID: doctor?.doctor_uid,
        hide: false,
        message: `${fullName} requesting to have a schedule`,
        senderID: patientUserUID,
        open: false,
        status: "unread",
        title: `Appointment Request with ${doctor?.doctor_uid}`,
        type: userAppointment,
        sender_FullName: fullName,
        receiver_FullName: doctor?.doctor_name,
        isApprove: false,
      });

      console.log("Appointment added:");
      setSuccessful(true);

      // Log whether the patient is new or old
      console.log(
        isNewPatient ? "New patient added." : "Old patient appointment added."
      );

      console.log("New notification added", notifAppointments);
    } catch (error) {
      console.log("Error adding data to Firebase:", error);
    } finally {
      setLoading(false);
    }
  };

  const doctor_skill = [{}];

  if (doctor?.doctor_specialty) {
    doctor_skill.push({
      key: `${doctor?.id}-specialty`,
      value: doctor?.doctor_specialty,
      label: doctor?.doctor_specialty,
    });
  }

  if (doctor?.doctor_sub_specialty) {
    doctor_skill.push({
      key: `${doctor?.id}-sub-specialty`,
      value: doctor.doctor_sub_specialty,
      label: doctor.doctor_sub_specialty,
    });
  }

  if (successful) {
    setInterval(() => {
      setSuccessful(false);
    }, 1500);
    return (
      <div className="h-screen">
        <div className="flex flex-row items-center justify-center mt-32 gap-4">
          <div className=" h-24 w-24 bg-white rounded-full flex items-center justify-center p-1 animate-bounce">
            <div className="h-full w-full rounded-full bg-[#25CA85] flex items-center justify-center flex-row">
              <FontAwesomeIcon icon={faCheck} className="text-white h-14" />{" "}
            </div>
          </div>
          <h1 className="font-montserrat font-bold text-3xl animate-bounce">
            Offer Request Is Succeful!
          </h1>
        </div>
      </div>
    );
  }

  console.log(status);

  return (
    <div className="h-full mx-52 py-4">
      <div className="flex justify-between flex-row items-center">
        <h1 className="font-montserrat mt-4 mb-8 font-bold text-3xl flex gap-5 items-center">
          <Link href="/">
            <FontAwesomeIcon icon={faArrowLeft} /> Doctor&#39;s Profile
          </Link>
        </h1>
        {(status[0]?.Appointment_Status === "Paid" ||
          !status[0]?.Appointment_Status) && (
          <span className="flex flex-col gap-2 text-center">
            <span
              className="text-lg flex items-center gap-2 font-montserrat font-bold px-4 py-2 rounded-full cursor-pointer bg-green-500 text-white"
              onClick={() => setDateModal(true)}
            >
              Consult Now <FontAwesomeIcon icon={faCircleCheck} />
            </span>
          </span>
        )}
      </div>
      {status[0]?.Appointment_Status !== "Paid" && (
        <h1
          className={`font-montserrat mt-16 mb-8 capitalize font-bold text-4xl flex flex-row 
          justify-between`}
        >
          {doctor?.doctor_title} {doctor?.doctor_name}
          <span className="bg-green-600 text-white px-7 text-2xl py-2 rounded-lg">
            {status[0]?.Appointment_Status}
          </span>
        </h1>
      )}

      <div className="p-4">
        <div className=" mb-8 flex flex-row items-center justify-between">
          <h1 className="font-montserrat capitalize font-bold text-4xl flex justify-between">
            {doctor?.doctor_title} {doctor?.doctor_name}
          </h1>
          <Rate value={doctor?.doctor_rating} disabled />
        </div>

        <div className="grid grid-cols-5 w-full">
          <div className="h-48 w-48 text-center rounded-full bg-white drop-shadow-lg flex justify-center items-center font-montserrat text-xl">
            Image of {doctor?.doctor_name}
          </div>
          <div className="flex flex-col gap-4 w-full col-span-4 ">
            <div className="w-full border-[1px] border-[#C3C3C3]" />
            <p className="font-montserrat text-lg">
              <FontAwesomeIcon icon={faMapPin} className="mr-2 text-red-500" />{" "}
              {doctor?.doctor_clinicAddress}
            </p>
            <p className="font-montserrat text-lg">
              <FontAwesomeIcon icon={faPhone} className="mr-2" />{" "}
              {doctor?.doctor_contact}
            </p>
            <p className="font-montserrat text-lg">
              {" "}
              <FontAwesomeIcon
                icon={faEnvelope}
                className="mr-2 text-slate-400"
              />{" "}
              {doctor?.doctor_email}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col mt-8 ">
        <div className="flex flex-col gap-20">
          <div className="flex flex-col gap-4 ">
            <h1 className="font-montserrat font-bold text-3xl flex justify-between cursor-pointer">
              Details
            </h1>
            <p className="flex flex-col gap-4 font-montserrat font-medium text-[#393939] pr-20 leading-7 text-justify">
              {doctor?.doctor_details}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <h1 className="font-montserrat font-bold text-3xl flex justify-between cursor-pointer">
              Services
            </h1>
            <ul className="bg-white font-hind text-center text-xl drop-shadow-lg w-80 py-4 rounded-md">
              <li>{doctor?.doctor_specialty}</li>
            </ul>
          </div>
          <div className=" w-fit mb-8 h-52 bg-white drop-shadow-md rounded-md items-center p-4 grid grid-cols-3">
            <h1 className=" col-span-3 font-montserrat font-bold text-4xl mb-5">
              Working Hours
            </h1>
            <span className="grid grid-cols-3 items-start mr-4 bg-[#006B95] text-white p-4 rounded-md">
              {doctor?.doctor_available_days?.map((day, dayIndex) => {
                const weekDay = weeks.find((week) => week.key === day)?.label;
                return (
                  <span key={dayIndex} className="text-center">
                    {weekDay}
                  </span>
                );
              })}
            </span>
            <div className="text-center">
              <h1>Time In:</h1>
              {doctor?.doctor_time_in}
            </div>
            <div className="text-center">
              <h1>Time Out:</h1>
              {doctor?.doctor_time_out}
            </div>
          </div>
        </div>
      </div>
      <div className="my-8 h-full flex flex-col gap-4">
        <h1 className="font-montserrat font-bold text-[#393939] text-3xl">
          Feedback and Rate
        </h1>
        {rateAndFeedback.map((data, index) => {
          return (
            <div
              key={index}
              className="grid grid-cols-11 h-56 bg-white drop-shadow-md rounded-md border-slate-300 border-[1px] pt-6"
            >
              <div className="border-[1px] mx-auto  border-slate-300 rounded-full w-14 h-14 flex items-center justify-center capitalize font-montserrat font-bold text-xl">
                {data?.Appointment_PatientFullName?.charAt(0)}
              </div>
              <div className="col-span-10">
                <h1 className="font-montserrat font-bold text-[#393939] text-lg capitalize">
                  {data?.Appointment_PatientFullName}
                </h1>
                <Rate value={data?.Appointment_Rate_Feedback?.rate} disabled />
                <div className="h-0.5 bg-slate-300 rounded-full my-4 w-11/12" />
                <div className="font-hind text-base font-medium text-[#393939] w-11/12">
                  {data?.Appointment_Rate_Feedback?.feedback}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Modal
        open={dateModal}
        onCancel={() => setDateModal(false)}
        onClose={() => setDateModal(false)}
        onOk={() => {
          setDateModal(false);
          submitDateAppointment();
        }}
        className="mt-32 relative z-10"
      >
        <h1 className="text-center my-8 font-montserrat font-bold text-[#006B95] text-xl">
          Select Date
        </h1>
        <div className="flex flex-col gap-5 items-center justify-around">
          <DatePicker
            format={"MMMM DD, YYYY"}
            needConfirm
            className="font-hind font-medium cursor-pointer"
            value={date}
            onChange={(date: Dayjs | null) => setDate(date)}
          />
          <Select
            allowClear
            onChange={(value: string) => {
              setDoctorSkill(value);
            }}
            placeholder="Select a type of appointment"
            options={doctor_skill}
            optionFilterProp="label"
            className="w-full"
          />
        </div>
        <div>
          <div
            ref={divRef}
            className={`absolute top-[220px] left-0 bg-white w-full rounded-md drop-shadow-xl z-20 `}
          >
            {showAppointments && (
              <div>
                <div>
                  {/* <h1
                        className="font-hind text-base font-medium flex flex-col"
                        onClick={() => {
                          setUserAppointment(
                            data?.User_TypeOfAppointment?.[0] || ""
                          );
                          setShowAppointments(false);
                        }}
                      >
                        {data?.User_TypeOfAppointment?.map((data) => data)}
                      </h1> */}
                  {doctor?.User_TypeOfAppointment?.map((data, index) => {
                    return (
                      <h1
                        key={index}
                        className="font-hind font-medium flex flex-col py-2 px-4 cursor-pointer hover:bg-slate-300"
                        onClick={() => {
                          setUserAppointment(data);
                          setShowAppointments(false);
                        }}
                      >
                        {data}
                      </h1>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>
      <Modal
        open={bookModal}
        onCancel={() => setBookModal(false)}
        onClose={() => setBookModal(false)}
        onOk={() => {
          setBookModal(false);
          setConfirmModal(true);
        }}
      >
        <p className="font-montserrat font-bold text-[#393939]">
          Do you wish to have an appointment with {doctor?.doctor_name}
        </p>
        <div className="grid grid-cols-3 items-center w-fit my-5 gap-4">
          {myPets.length > 0 ? (
            <div className="col-span-3 grid grid-cols-3 items-center w-fit my-5 gap-4">
              {myPets.map((data) => {
                return (
                  <label
                    key={data?.id}
                    htmlFor={data?.id}
                    className={` cursor-pointer w-fit`}
                  >
                    <Image
                      src={`/${data?.pet_name?.toLowerCase()}.jpg`}
                      height={105}
                      width={130}
                      alt={`${data?.pet_name} Image`}
                      className={`${
                        data?.id === selectedPet?.id
                          ? "border-8 border-blue-300"
                          : "border-none border-0"
                      } object-cover rounded-lg`}
                    />
                    <h1 className="absolute bottom-1 left-5 font-bold font-montserrat text-2xl text-white">
                      {data?.pet_name}
                    </h1>
                    <input
                      type="radio"
                      name="select-pet"
                      id={data?.id}
                      className="hidden"
                      value={data?.id}
                      onClick={() => setSelectedPet(data)}
                    />
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="col-span-3 grid grid-cols-3 items-center w-fit my-5 gap-4">
              <label
                htmlFor="petID"
                className="font-montserrat font-bold text-lg text-[#393939]"
              >
                Pet Name
              </label>
              <input
                className="h-9 w-56 rounded-lg col-span-2 drop-shadow-md font-hind text-[#393939] bg-white outline-none px-2 placeholder:font-hind"
                type="text"
                name="pet"
                id="petID"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="Enter the name of your pet"
              />
              <label
                htmlFor="petTypeAnimal"
                className="font-montserrat font-bold text-lg text-[#393939]"
              >
                Pet Animal Type
              </label>
              <input
                className="h-9 w-56 rounded-lg col-span-2 drop-shadow-md font-hind text-[#393939] bg-white outline-none px-2 placeholder:font-hind"
                type="text"
                name="typeAnimal"
                id="petTypeAnimal"
                value={petTypeAnimal}
                onChange={(e) => setPetTypeAnimal(e.target.value)}
                placeholder="Ex. Dog"
              />
              <label
                htmlFor="petBreed"
                className="font-montserrat font-bold text-lg text-[#393939]"
              >
                Pet Breed
              </label>
              <input
                className="h-9 w-56 rounded-lg col-span-2 drop-shadow-md font-hind text-[#393939] bg-white outline-none px-2 placeholder:font-hind"
                type="text"
                name="breed"
                id="petBreed"
                value={petBreed}
                onChange={(e) => setPetBreed(e.target.value)}
                placeholder="Enter the breed of your pet"
              />
              <h1 className="col-span-3 font-montserrat font-bold text-lg text-[#393939] mt-8">
                Input your pet age
              </h1>
              <label
                htmlFor="petYear"
                className="text-end font-montserrat font-bold text-base text-[#393939]"
              >
                Year
              </label>
              <input
                type="number"
                name="year"
                id="petYear"
                placeholder="Ex. 1"
                value={petYear == 0 ? "" : petYear}
                onChange={(e) => setPetYear(Number(e.target.value))}
                className=" h-9 w-56 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none rounded-lg col-span-2 drop-shadow-md font-hind text-[#393939] bg-white outline-none px-2 placeholder:font-hind"
              />
              <label
                htmlFor="petMonth"
                className="text-end font-montserrat font-bold text-base text-[#393939]"
              >
                Month
              </label>
              <input
                type="number"
                name="month"
                id="petMonth"
                placeholder="Ex. 3"
                value={petMonth == 0 ? "" : petMonth}
                onChange={(e) => setPetMonth(Number(e.target.value))}
                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-9 w-56 rounded-lg col-span-2 drop-shadow-md font-hind text-[#393939] bg-white outline-none px-2 placeholder:font-hind"
              />
            </div>
          )}
          <h1 className="col-span-3 font-montserrat font-bold text-lg text-[#393939] mt-6">
            Input the blood pressure of your pet
          </h1>
          <label
            htmlFor="mmBP"
            className="text-end font-montserrat font-bold text-base text-[#393939]"
          >
            mm
          </label>
          <input
            type="number"
            name="mm"
            id="mmBP"
            value={petMM == 0 ? "" : petMM}
            onChange={(e) => setPetMM(Number(e.target.value))}
            placeholder="(optional)  Ex. 120"
            className=" h-9 w-56 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none rounded-lg col-span-2 drop-shadow-md font-hind text-[#393939] bg-white outline-none px-2 placeholder:font-hind"
          />
          <label
            htmlFor="HgBP"
            className="text-end font-montserrat font-bold text-base text-[#393939]"
          >
            Hg
          </label>
          <input
            type="number"
            name="Hg"
            id="HgBP"
            placeholder="(optional) Ex. 90"
            value={petHg == 0 ? "" : petHg}
            onChange={(e) => {
              setPetHg(Number(e.target.value));
            }}
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-9 w-56 rounded-lg col-span-2 drop-shadow-md font-hind text-[#393939] bg-white outline-none px-2 placeholder:font-hind"
          />
        </div>
        <h1 className="col-span-3 font-montserrat font-bold text-lg text-[#393939] mt-10">
          Choose Type Of Payment
        </h1>
        <div className="col-span-3 grid grid-cols-3 px-2 mt-4">
          {options.map((data) => {
            return (
              <div key={data.id} className="flex flex-row items-center gap-2 ">
                <input
                  type="radio"
                  name="payment-method"
                  id={data?.label}
                  value={data?.label}
                  checked={typeOfPayment === data?.label}
                  onChange={() => {
                    setTypeOfPayment(data?.label);
                  }}
                  className="cursor-pointer"
                />
                <Image
                  src={`/${data?.img}`}
                  height={30}
                  width={30}
                  alt={data?.label}
                />
                <label
                  htmlFor={data?.label}
                  className="font-montserrat font-semibold text-sm cursor-pointer"
                >
                  {data?.label}
                </label>
              </div>
            );
          })}
        </div>
      </Modal>

      <Modal
        open={confirmModal}
        onCancel={() => setConfirmModal(false)}
        onOk={() => {
          onSubmit(doctor?.doctor_uid || "");
          setConfirmModal(false);
        }}
        centered={true}
      >
        Please confirm your appointment on{" "}
        <span className="font-montserrat font-bold text-[#006B95] capitalize">
          {doctor?.doctor_name}
        </span>
      </Modal>
    </div>
  );
}

function LoadingNavbar() {
  return (
    <div className="h-screen animate-pulse">
      <nav className="ml-72 gap-8 h-fit flex flex-row items-center  animate-pulse">
        <ul className="flex flex-row h-full items-center gap-4">
          <li className="bg-slate-300 drop-shadow-xl rounded-full h-14 w-14" />
          <li className="bg-slate-300 h-10 w-32 drop-shadow-xl rounded-xl" />
        </ul>
        <ul className="flex flex-row h-full items-center gap-4">
          <li className="bg-slate-300 h-8 w-32 drop-shadow-xl rounded-xl"></li>
          <li className="bg-slate-300 h-8 w-32 drop-shadow-xl rounded-xl"></li>
          <li className="bg-slate-300 h-8 w-32 drop-shadow-xl rounded-xl"></li>
          <li className="bg-slate-300 h-8 w-32 drop-shadow-xl rounded-xl"></li>
        </ul>
        <ul className="flex flex-row h-full items-center gap-4">
          <li className="bg-slate-300 drop-shadow-xl rounded-full h-7 w-7" />
          <li className="bg-slate-300 drop-shadow-xl rounded-full h-7 w-7" />
          <li className="bg-slate-300 drop-shadow-xl rounded-full h-7 w-7" />
        </ul>
      </nav>
    </div>
  );
}

function LoadingProfile() {
  return (
    <div className="h-fit flex flex-row mx-48 pt-10 items-center animate-pulse">
      <div className="h-40 w-40 rounded-full bg-slate-300 drop-shadow-lg mr-20" />
      <div className="w-full flex flex-col gap-10 py-2">
        <div className="h-1 w-96  bg-slate-300" />
        <div className="h-1 w-96 bg-slate-300" />
        <div className="h-1 w-96 bg-slate-300" />
      </div>
    </div>
  );
}
