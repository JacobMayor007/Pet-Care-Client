"use client";

import ClientNavbar from "../ClientNavbar/page";
import Image from "next/image";
import { DatePicker, Modal } from "antd";
import "@ant-design/v5-patch-for-react-19";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faCheck,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import isAuthenticate from "../fetchData/isAuthenticate";
import dayjs, { Dayjs } from "dayjs"; // Ensure dayjs is imported
import {
  collection,
  getDocs,
  query,
  where,
  DocumentData,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import Loading from "../Loading/page";
import fetchUserData from "../fetchData/fetchUserData";
import { getMyPets } from "./mypet";

// import fetchDoctor from "../fetchData/Doctor/fetchDoctor";
// import { log } from "console";

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

export default function Doctors() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [seeMore, setSeeMore] = useState(false);
  const [showAppointments, setShowAppointments] = useState(false);
  const [myPets, setMyPets] = useState<MyPets[]>([]);
  const [doctor, setDoctor] = useState<Doctor[]>([]);
  const [showXMark, setShowXMark] = useState(false);
  const [userAppointment, setUserAppointment] = useState("");
  const [userAppointmentDate, setUserAppointmentDate] = useState<Dayjs | null>(
    null
  );
  const [modal, setModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [userData, setUserData] = useState<DocumentData[]>([]);
  const [other, setOther] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userWeek, setUserWeek] = useState(0);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedPet, setSelectedPet] = useState<MyPets | null>(null);
  const [typeOfPayment, setTypeOfPayment] = useState("");
  const [petName, setPetName] = useState("");
  const [petBreed, setPetBreed] = useState("");
  const [petYear, setPetYear] = useState(0);
  const [petMonth, setPetMonth] = useState(0);
  const [petMM, setPetMM] = useState(0);
  const [petHg, setPetHg] = useState(0);
  const [petTypeAnimal, setPetTypeAnimal] = useState("");
  // const [userAppointmentTime, setUserAppointmentTime] = useState<Dayjs | null>(
  //   null
  // );

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
    {
      key: 15,
      label: "General Practice",
      value: "General Practice",
    },
  ];

  // useEffect(() => {
  //   const getDoctors = async () => {
  //     const fetchedDoctors = await fetchDoctor();
  //     setDoctor(fetchedDoctors);
  //   };
  //   getDoctors();
  // }, []);

  useEffect(() => {
    const getUserData = async () => {
      const fetchedUserData = await fetchUserData();
      setUserData(fetchedUserData);
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

  const searchDoctor = async () => {
    if (!userAppointmentDate || !userAppointment) {
      return alert("Please input date, time, and type of service");
    }

    try {
      setLoading(true);
      console.log(
        `Searching for doctors available on day: ${userWeek} (${typeof userWeek})`
      );

      // Query the database for doctors available on the given day
      const doctorQuery = query(
        collection(db, "doctor"),
        where("doctor_available_days", "array-contains", userWeek)
      );

      const querySnapshot = await getDocs(doctorQuery);

      // Map the documents to the Doctor interface
      const availableDoctors: Doctor[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Doctor),
      }));

      // Filter the results manually to match the second condition
      const filteredDoctors = availableDoctors.filter(
        (doctor) =>
          doctor.doctor_specialty?.includes(userAppointment) ||
          doctor.doctor_sub_specialty?.includes(userAppointment)
      );

      console.log("Available Doctors", filteredDoctors);

      // Update the state with the filtered list of doctors
      setDoctor(filteredDoctors);
    } catch (err) {
      console.error("Error fetching the week data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuthentication = async () => {
      const login = await isAuthenticate();
      if (!login) {
        router.push("/Login"); // Redirect if not logged in
      } else {
        setIsLoggedIn(true); // Set state if logged in
      }
    };

    checkAuthentication();
  }, [router]);

  const dateChange = (date: Dayjs | null) => {
    setUserAppointmentDate(date);
  };

  // const timeChange = (time: Dayjs | null) => {
  //   setUserAppointmentTime(time);
  // };

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

  // const fullName = userData
  //   .map((user) => `${user?.User_FName} ${user?.User_LName}`)
  //   .join(",");

  const onSubmit = async (id: string, petID: string) => {
    const fullName = userData[0]?.User_Name;

    try {
      setLoading(true);

      if (!userAppointmentDate) {
        throw new Error("Appointment date is required.");
      }

      const appointmentDate = Timestamp.fromDate(
        dayjs.isDayjs(userAppointmentDate)
          ? userAppointmentDate.toDate() // Convert Dayjs to Date
          : new Date(userAppointmentDate) // Convert to Date if it's a string
      );

      const matchingDoctor = doctor.find((data) => data?.User_UID === id);
      const selectedPet = myPets.find((data) => data?.id === petID);
      if (!matchingDoctor) {
        throw new Error("Matching doctor not found.");
      }

      const patientUserUID = userData[0]?.User_UID || "";
      const docRef = collection(db, "appointments");
      const docNotifRef = collection(db, "notifications");
      // Check if the patient is new or old
      const q = query(
        docRef,
        where("Appointment_DoctorUID", "==", matchingDoctor.User_UID),
        where("Appointment_PatientUserUID", "==", patientUserUID)
      );
      const querySnapshot = await getDocs(q);

      const isNewPatient = querySnapshot.empty; // If no prior appointments, the patient is new

      // Add the appointment to Firestore
      const addAppointments = await addDoc(docRef, {
        Appointment_PatientFullName: fullName,
        Appointment_CreatedAt: Timestamp.now(),
        Appointment_PatientUserUID: patientUserUID,
        Appointment_DoctorEmail: matchingDoctor?.doctor_email,
        Appointment_DoctorName: matchingDoctor?.doctor_name,
        Appointment_TypeOfAppointment: userAppointment,
        Appointment_Date: appointmentDate,
        Appointment_DoctorUID: matchingDoctor.doctor_uid,
        Appointment_Location: matchingDoctor.doctor_clinicAddress,
        Appointment_DoctorPNumber: matchingDoctor.doctor_email,
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
        receiverID: matchingDoctor.User_UID,
        hide: false,
        message: `${fullName} requesting to have a schedule`,
        senderID: patientUserUID,
        open: false,
        status: "unread",
        title: `Appointment Request with ${matchingDoctor?.User_UID}`,
        type: userAppointment,
        sender_FullName: fullName,
        receiver_FullName: matchingDoctor?.User_Name,
        isApprove: false,
      });

      console.log("Appointment added:");

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

  useEffect(() => {
    setUserWeek(Number(userAppointmentDate?.get("d")));
  }, [userAppointmentDate]);

  if (!isLoggedIn) {
    return (
      <div>
        <div></div>
      </div>
    );
  }

  return (
    <div className="h-full mb-6 flex flex-col gap-2">
      <div className="relative z-[3]">
        <ClientNavbar />
      </div>
      <div className="h-2/3 bg-[#006B95] relative z-[2] flex flex-row justify-between px-14">
        <div className="flex flex-col z-[2] gap-10 mt-14 ml-20">
          <div className="flex flex-col ">
            <h1 className="text-5xl text-white font-montserrat tracking-wider font-bold leading-[60px] w-96">
              Schedule an appointment with vet now
            </h1>
            <p className="font-montserrat text-lg text-white">
              Setup an appointment with our experts
            </p>
          </div>
          <span className="h-12 px-4 w-fit py-2 border-2 border-white font-hind text-lg text-white rounded-full">
            Book an appointment
          </span>
        </div>
        <Image
          src="/Stethoscope.svg"
          height={390}
          width={390}
          alt="Stethoscope svg"
          className="absolute object-contain left-1"
        />
        <Image
          src="/Paw Group.svg"
          height={290}
          width={290}
          alt="Paw Print Group"
          className="absolute object-contain right-1"
        />
        <div className="relative z-[2] h-[420px] w-[600px] mr-44">
          <Image
            src="/Doctor Pet Check.svg"
            layout="fill"
            objectFit="fill"
            alt="Doctor Checking Pet with Stethoscope"
          />
        </div>
      </div>
      <div className="-mt-8 relative w-full h-fit z-[2] ">
        <div className="mx-auto bg-white w-[85%] grid grid-cols-3 rounded-2xl drop-shadow-xl h-fit py-4 px-6 items-center gap-4">
          <div
            className={` h-12 w-full ${
              userAppointmentDate ? `bg-white drop-shadow-lg` : `bg-[#D6EBEC]`
            } p-2 gap-1 rounded-xl w-full`}
          >
            <DatePicker
              needConfirm
              format="MMMM / DD / YYYY"
              className={`outline-none border-none font-montserrat text-lg w-full  ${
                userAppointmentDate
                  ? `bg-white active:bg-white `
                  : `bg-transparent active:bg-transparent`
              }`}
              onChange={dateChange}
            />
          </div>
          <div
            className={`h-12 ${
              !userAppointment ? `bg-[#D6EBEC]` : `bg-white drop-shadow-lg`
            } w-full rounded-xl flex justify-around items-center px-2`}
          >
            <div className="h-full w-full flex justify-between items-center relative gap-2">
              <div
                className={`flex items-center h-full w-full px-5 ${
                  userAppointment
                    ? `font-hind font-medium`
                    : `text-slate-400 font-hind text-base`
                }`}
              >
                {other ? (
                  <input
                    ref={inputRef}
                    type="text"
                    id="userAppointment"
                    name="user-appointment"
                    onClick={() =>
                      setShowAppointments(userAppointment ? true : false)
                    }
                    className={`h-full w-full outline-none font-hind font-medium autofill:bg-white ${
                      userAppointment
                        ? `bg-white cursor-pointer`
                        : `bg-[#D6EBEC] focus:outline-none focus:text-black`
                    }`}
                    value={userAppointment}
                    onChange={(e) => setUserAppointment(e.target.value)}
                  />
                ) : userAppointment ? (
                  userAppointment
                ) : (
                  `Select type of service `
                )}
              </div>
              <div
                onMouseOver={() => setShowXMark(userAppointment ? true : false)}
                onMouseOut={() => setShowXMark(false)}
              >
                {showXMark ? (
                  <div className="h-6 w-6 hover:bg-slate-300 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faXmark}
                      className="text-lg cursor-pointer bg-slate-300 rounded-full"
                      onClick={() => {
                        setUserAppointment("");
                      }}
                    />
                  </div>
                ) : (
                  <FontAwesomeIcon
                    icon={faCaretDown}
                    className="text-lg cursor-pointer"
                    onClick={() => {
                      setShowAppointments((prev) => !prev);
                      setSeeMore(false);
                    }}
                  />
                )}
              </div>
              <div className="absolute top-14 bg-white w-full rounded-md drop-shadow-xl">
                {showAppointments ? (
                  <div className=" flex flex-col gap-2 py-2 px-4 rounded-md ">
                    {doctorServices
                      .slice(!seeMore ? 0 : 0, !seeMore ? 5 : 16)
                      .map((data) => {
                        return (
                          <div
                            key={data?.key}
                            className=" cursor-pointer hover:bg-slate-200 p-2 rounded-md"
                          >
                            <h1
                              className="font-hind text-base font-medium"
                              onClick={() => {
                                setUserAppointment(data?.label);
                                setShowAppointments((prev) => !prev);
                              }}
                            >
                              {data?.label}
                            </h1>
                          </div>
                        );
                      })}
                    <button
                      className="mt-2 font-montserrat text-sm font-bold"
                      onClick={() => setSeeMore((prev) => !prev)}
                    >
                      {seeMore ? `See Less..` : <h1>See More...</h1>}
                    </button>
                    <button
                      type="button"
                      className="mt-2 font-montserrat text-sm font-bold italic"
                      onClick={() => {
                        setOther(true);
                        inputRef.current?.focus();
                        setShowAppointments(false);
                      }}
                    >
                      Others
                    </button>
                  </div>
                ) : (
                  <div></div>
                )}
              </div>
            </div>
          </div>

          <a
            href="#doctorAvailable"
            className="h-full w-full rounded-md bg-[#77D8DD] hover:bg-[#62c9cf] flex items-center justify-center font-montserrat text-xl font-bold text-white hover:text-[#eaefec]"
            onClick={searchDoctor}
          >
            Search
          </a>
        </div>
      </div>
      <div className="h-full px-32 ">
        <div className="flex justify-center items-center flex-col mt-16 mb-8">
          <h1 className="text-4xl font-montserrat font-bold">Meet Our Vets</h1>
          <p className="text-xl font-montserrat">
            Meet our capable team who will be taking the best Care of your pets.
          </p>

          {doctor.length > 0 ? (
            <div className="flex flex-row items-center mt-8 gap-10">
              <div className="relative flex items-center justify-center">
                {/* Outer pulsing circle */}
                <div className="h-12 w-12 rounded-full bg-slate-300 animate-ping"></div>

                <div className="absolute h-10 w-10 bg-white rounded-full flex items-center justify-center p-1">
                  <div className="h-full w-full rounded-full bg-[#25CA85] flex items-center justify-center flex-row">
                    <FontAwesomeIcon icon={faCheck} className="text-white" />{" "}
                  </div>
                </div>
              </div>{" "}
              <h1 className="text-3xl font-montserrat text-[#25CA85] font-bold">
                Doctors Available Now!
              </h1>
            </div>
          ) : (
            <div></div>
          )}
        </div>
        <div id="doctorAvailable">
          {loading ? (
            <Loading />
          ) : (
            <div className="pt-28 grid grid-cols-4 gap-4 w-full">
              {doctor.map((data, index) => {
                return (
                  <div
                    key={index}
                    className="relative w-72 h-full bg-[#006B95] flex justify-center rounded-2xl pb-4"
                  >
                    <div className="h-40 w-40 rounded-full bg-white p-1 drop-shadow-xl  absolute -top-24 flex flex-col">
                      <div className="h-full w-full rounded-full bg-blue-500 text-center flex items-center p-1">
                        Image of {data?.doctor_name}
                      </div>
                    </div>
                    <div className="flex flex-col mt-20 items-center">
                      <h1 className="font-hind font-bold text-3xl text-white">
                        Dr. {data?.doctor_name}
                      </h1>
                      <div className="flex flex-col gap-2 items-center px-4 mt-8 h-full">
                        <h1 className="text-center font-hind text-lg text-white font-medium row-span-3">
                          {data?.doctor_clinicAddress}
                        </h1>
                        <h1 className="text-center font-hind text-lg text-white font-medium">
                          {data?.doctor_contact}
                        </h1>
                        <h1 className="text-center font-hind text-lg text-white font-medium row-span-5">
                          Available Days: <br />
                          <span className="grid grid-cols-3 items-start">
                            {data?.doctor_available_days?.map(
                              (day, dayIndex) => {
                                const weekDay = weeks.find(
                                  (week) => week.key === day
                                )?.label;
                                return <span key={dayIndex}>{weekDay}</span>;
                              }
                            )}
                          </span>
                        </h1>
                        <div className="text-center font-hind text-lg items-center text-white font-medium row-span-5 grid grid-cols-2 gap-2 mt-4">
                          <h1 className="">Specialty:</h1>
                          {/* {data?.User_TypeOfAppointment?.map((data, index) => {
                            return (
                              <span
                                key={index}
                                className="overflow-hidden text-ellipsis whitespace-nowrap"
                              >
                                {data}
                              </span>
                            );
                          })} */}
                          <h1 className="">Sub Specialty:</h1>
                          <p className="">{data?.doctor_specialty}</p>
                          <p className="">{data?.doctor_sub_specialty}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="text-xl font-montserrat font-bold row-span-1 h-14 bg-white mt-4 px-6 rounded-full text-[#006B95]"
                        onClick={() => {
                          // setSelectPetModal(true);
                          setModal(true);
                          setSelectedDoctor(data);
                        }}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedDoctor && (
            <div>
              <Modal
                open={modal}
                onOk={() => {
                  setConfirmModal(true);
                  setModal(false);
                }}
                onCancel={() => {
                  setModal(false);
                  console.log(selectedDoctor?.User_UID);
                }}
                centered
              >
                <p className="font-montserrat font-bold text-[#393939]">
                  Do you wish to have an appointment with{" "}
                  <span className="capitalize">
                    {selectedDoctor?.doctor_name}
                  </span>
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
                    placeholder="Ex. 120"
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
                    placeholder="Ex. 90"
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
                      <div
                        key={data.id}
                        className="flex flex-row items-center gap-2 "
                      >
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
                  onSubmit(
                    selectedDoctor?.User_UID || "",
                    selectedPet?.id || ""
                  );
                  setConfirmModal(false);
                }}
                centered={true}
              >
                Please confirm your appointment on {selectedDoctor?.User_Name}
              </Modal>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
