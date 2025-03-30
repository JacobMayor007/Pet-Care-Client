"use client";

import ClientNavbar from "@/app/ClientNavbar/page";
import { faEdit, faPlus, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import fetchUserData from "@/app/fetchData/fetchUserData";
import { useEffect, useState } from "react";
import { DocumentData } from "firebase/firestore";
import dayjs, { Dayjs } from "dayjs";
import {
  getMyPets,
  myAppointments,
  myBoard,
  myOrders,
  submitPetHandle,
} from "./myData";
import "@ant-design/v5-patch-for-react-19";
import Link from "next/link";
import Image from "next/image";
import { Modal, Rate } from "antd";

interface Order {
  id?: string;
  OC_BuyerFullName?: string;
  OC_BuyerID?: string;
  OC_ContactNumber?: string;
  OC_DeliverAddress?: string;
  OC_DeliverTo?: string;
  OC_OrderAt?: Dayjs | null;
  OC_PaymentMethod?: string;
  OC_Products?: {
    OC_ProductID?: string;
    OC_ProductName?: string;
    OC_ProductPrice?: string;
    OC_ProductQuantity?: number;
    OC_ShippingFee?: number;
  };
  OC_SellerFullName?: string;
  OC_SellerID?: string;
  OC_Status?: string;
  OC_TotalPrice?: number;
  OC_RatingAndFeedback?: {
    feedback?: string;
    rating?: number;
  };
}

interface BoardDetails {
  boardId?: string;
  BC_BoarderUID?: string;
  BC_BoarderFullName?: string;
  BC_BoarderEmail?: string;
  BC_BoarderBoardedAt?: Dayjs | null;
  BC_BoarderCheckInTime?: Dayjs | null;
  BC_BoarderCheckOutTime?: Dayjs | null;
  BC_BoarderCheckInDate?: Dayjs | null;
  BC_BoarderCheckOutDate?: Dayjs | null;
  BC_BoarderChoiceFeature?: [
    {
      label?: string;
      name?: string;
      value?: number;
    }
  ];
  BC_BoarderDays?: number;
  BC_BoarderDietaryRestrictions?: string;
  BC_BoarderGuest?: string;
  BC_BoarderStatus?: string;
  BC_BoarderRate?: number;
  BC_BoarderTotalPrice?: number;
  BC_BoarderUpdated?: Dayjs | null;
  BC_BoarderTypeRoom?: string;
  BC_RenterRoomID?: string;
  BC_RenterFullName?: string;
  BC_RenterUID?: string;
  BC_RenterRoomName?: string;
  BC_RenterPrice?: string;
  BC_RenterLocation?: string;
  BC_RenterEmail?: string;
  BC_TypeOfPayment?: string;
}

interface Appointment {
  id?: string;
  Appointment_CreatedAt?: string;
  Appointment_Date?: Dayjs | null;
  Appointment_DoctorEmail?: string;
  Appointment_DoctorName?: string;
  Appointment_DoctorPNumber?: string;
  Appointment_DoctorUID?: string;
  Appointment_IsNewPatient?: boolean;
  Appointment_Location?: string;
  Appointment_PatientFName?: string;
  Appointment_PatientFullName?: string;
  Appointment_PatientPetAge?: {
    Month?: number;
    Year?: number;
  };
  Appointment_PatientPetBP?: {
    Hg?: number;
    mm?: number;
  };
  Appointment_PatientPetBreed?: string;
  Appointment_PatientPetName?: string;
  Appointment_PatientTypeOfPayment?: string;
  Appointment_PatientUserUID?: string;
  Appointment_Status?: string;
  Appointment_Time?: string;
  Appointment_TypeOfAppointment?: string;
  Appointment_Price?: number;
}

interface MyPets {
  id?: string;
  pet_age?: {
    month?: number;
    year?: number;
  };
  pet_name?: string;
  pet_ownerEmail?: string;
  pet_ownerName?: string;
  pet_ownerUID?: string;
  pet_sex?: string;
  pet_type?: string;
}

export default function UserProfile() {
  const [userData, setUserData] = useState<DocumentData[]>([]);
  const [listOfOrders, setListOfOrders] = useState<Order[]>([]);
  const [boardDetails, setBoardDetails] = useState<BoardDetails[]>([]);
  const [appointment, setAppointment] = useState<Appointment[]>([]);
  const [addNewPetModal, setAddNewPetModal] = useState(false);
  const [confirmAddNewPetModal, setConfirmAddNewPetModal] = useState(false);
  const [petName, setPetName] = useState("");
  const [petYear, setPetYear] = useState(0);
  const [petMonth, setPetMonth] = useState(0);
  const [petSex, setPetSex] = useState("");
  const [petType, setPetType] = useState("");
  const [myPets, setMyPets] = useState<MyPets[]>([]);
  const [petBreed, setPetBreed] = useState("");
  const [rated, setRated] = useState(false);

  useEffect(() => {
    const getListOfOrders = async () => {
      const myListOrders = await myOrders(userData[0]?.User_UID);
      setListOfOrders(
        myListOrders.map((myOrders: Order) => ({
          ...myOrders,
          OC_OrderAt: myOrders?.OC_OrderAt
            ? dayjs((myOrders?.OC_OrderAt).toDate())
            : null,
        }))
      );

      const isRated = listOfOrders?.map(
        (doc) => doc?.OC_RatingAndFeedback?.rating
      );

      setRated(isRated ? true : false);
    };
    getListOfOrders();
  }, [userData, rated, listOfOrders]);

  useEffect(() => {
    const getUserData = async () => {
      const user = await fetchUserData();
      setUserData(user);
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
    const getMyAppointments = async () => {
      const appointments = await myAppointments(userData[0]?.User_UID);

      setAppointment(
        appointments.map((appoint: Appointment) => ({
          ...appoint,
          Appointment_Date: appoint?.Appointment_Date
            ? dayjs((appoint?.Appointment_Date).toDate())
            : null,
        }))
      );
    };
    getMyAppointments();
  }, [userData]);

  console.log();

  useEffect(() => {
    const getMyBoard = async () => {
      const roomDetails = await myBoard(userData[0]?.User_UID);

      setBoardDetails(
        roomDetails?.map((board: BoardDetails) => ({
          ...board,
          BC_BoarderBoardedAt: board?.BC_BoarderBoardedAt
            ? dayjs((board?.BC_BoarderBoardedAt).toDate())
            : null,
          BC_BoarderCheckInDate: board?.BC_BoarderCheckInDate
            ? dayjs((board?.BC_BoarderCheckInDate).toDate())
            : null,
          BC_BoarderCheckOutDate: board?.BC_BoarderCheckOutDate
            ? dayjs((board?.BC_BoarderCheckOutDate).toDate())
            : null,
          BC_BoarderCheckInTime: board?.BC_BoarderCheckInTime
            ? dayjs((board?.BC_BoarderCheckInTime).toDate())
            : null,
          BC_BoarderCheckOutTime: board?.BC_BoarderCheckOutTime
            ? dayjs((board?.BC_BoarderCheckOutTime).toDate())
            : null,
          BC_BoarderUpdated: board?.BC_BoarderUpdated
            ? dayjs((board?.BC_BoarderUpdated).toDate())
            : null,
        }))
      );
    };

    getMyBoard();
  }, [userData]);

  const confirmModal = () => {
    if (!petName || !petMonth || !petYear || !petType || !petSex || !petBreed) {
      alert("Please input all fields");
    } else {
      setConfirmAddNewPetModal(true);
      setAddNewPetModal(false);
    }
  };

  return (
    <div className="h-full pb-16 ">
      <nav>
        <ClientNavbar />
      </nav>
      <div className="h-44 bg-[url('/wave.svg')]" />
      <div className="mx-52 flex flex-col ">
        <div className="mx-auto -mt-9">
          <div className="h-32 w-32 rounded-full mx-auto mb-4 border-gray-300 bg-white border-[1px] flex items-center justify-center ">
            <FontAwesomeIcon icon={faUser} className=" text-7xl" />
          </div>
          <h1 className="text-center text-2xl font-montserrat font-bold mt-2 inline capitalize">
            {userData[0]?.User_Name}
          </h1>
          <FontAwesomeIcon
            icon={faEdit}
            className="ml-5 text-xl text-[#006B95]"
          />
        </div>

        <h1 className="mt-8 mb-4 font-montserrat font-bold text-2xl text-[#393939]">
          My Pets
        </h1>
        <div className="mb-8 w-full flex flex-row items-center gap-4">
          {myPets.length > 0 ? (
            myPets.map((data) => {
              return (
                <div key={data?.id} className="relative">
                  <Image
                    src={`/${data?.pet_name?.toLocaleLowerCase()}.jpg`}
                    height={205}
                    width={205}
                    alt={`${data?.pet_name} Image`}
                    className="object-cover rounded-lg"
                  />
                  <h1 className="absolute bottom-1 left-5 font-bold font-montserrat text-2xl text-white">
                    {data?.pet_name}
                  </h1>
                </div>
              );
            })
          ) : (
            <div className="text-xl my-8 font-bold font-montserrat h-52 w-52 bg-white rounded-md drop-shadow-md flex items-center justify-center pt-4">
              You have no pets
            </div>
          )}
          <button
            className="h-52 w-48 text-xl font-montserrat font-bold text-[#006B95] border-[#006B95] border-2 rounded-md hover:border-blue-500 hover:text-blue-500"
            onClick={() => setAddNewPetModal(true)}
          >
            <span className="block text-4xl">
              <FontAwesomeIcon icon={faPlus} />
            </span>
            Add New Pet
          </button>
          <Modal
            open={addNewPetModal}
            centered
            onCancel={() => setAddNewPetModal(false)}
            onClose={() => setAddNewPetModal(false)}
            onOk={() => {
              confirmModal();
            }}
          >
            <div className="grid grid-cols-2 px-14 items-center ">
              <h1 className="col-span-2 mt-2 mb-8 font-montserrat font-bold text-xl">
                Enter your pet&#39; information
              </h1>
              <label
                htmlFor="pet-name"
                className="font-montserrat font-bold text-[#393939] text-lg "
              >
                Pet Name
              </label>
              <input
                type="text"
                name="petname"
                id="pet-name"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                className="h-8 outline-none px-2 font-hind font-semibold border-[#797979] rounded-md border-[1px]"
              />
              <div className="col-span-2 grid grid-cols-4 items-center my-4">
                <h1 className="font-montserrat font-bold text-[#393939] text-lg col-span-4 mb-2">
                  Pet Age
                </h1>
                <label
                  htmlFor="pet-year"
                  className="font-montserrat font-bold text-[#414141] ml-2 text-center"
                >
                  Year
                </label>
                <input
                  type="number"
                  name="petyear"
                  id="pet-year"
                  value={petYear == 0 ? `` : petYear}
                  onChange={(e) => setPetYear(Number(e.target.value))}
                  placeholder="Ex. 1"
                  className="h-7 outline-none px-2 font-hind font-semibold border-[#797979] rounded-md border-[1px] [&::-webkit-inner-spin-button]:appearance-none"
                />
                <label
                  htmlFor="pet-month"
                  className="font-montserrat font-bold text-[#414141] text-center"
                >
                  Month
                </label>
                <input
                  placeholder="Ex. 1"
                  type="number"
                  name="petmonth"
                  value={petMonth == 0 ? `` : petMonth}
                  onChange={(e) => setPetMonth(Number(e.target.value))}
                  id="pet-month"
                  className="h-7 outline-none px-2 font-hind font-semibold border-[#797979] rounded-md border-[1px] [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="col-span-2 grid grid-cols-2 mb-2 items-center">
                <label
                  htmlFor="pet-name"
                  className="font-montserrat font-bold text-[#393939] text-lg"
                >
                  Pet Sex
                </label>
                <input
                  type="text"
                  name="petsex"
                  id="pet-sex"
                  value={petSex}
                  onChange={(e) => setPetSex(e.target.value)}
                  className="h-8 outline-none px-2 font-hind font-semibold border-[#797979] rounded-md border-[1px]"
                />
              </div>
              <div className="col-span-2 grid grid-cols-2 items-cente">
                <label
                  htmlFor="pet-type"
                  className="font-montserrat font-bold text-[#393939] text-lg"
                >
                  Pet Type
                </label>
                <input
                  type="text"
                  name="pettype"
                  id="pet-type"
                  value={petType}
                  onChange={(e) => setPetType(e.target.value)}
                  className="h-8 outline-none px-2 font-hind font-semibold border-[#797979] rounded-md border-[1px]"
                />
              </div>
              <div className="col-span-2 grid grid-cols-2 items-center my-2">
                <label
                  htmlFor="pet-type"
                  className="font-montserrat font-bold text-[#393939] text-lg"
                >
                  Pet Breed
                </label>
                <input
                  type="text"
                  name="petbreed"
                  id="pet-breed"
                  value={petBreed}
                  onChange={(e) => setPetBreed(e.target.value)}
                  className="h-8 outline-none px-2 font-hind font-semibold border-[#797979] rounded-md border-[1px]"
                />
              </div>
            </div>
          </Modal>

          <Modal
            open={confirmAddNewPetModal}
            centered
            onCancel={() => {
              setConfirmAddNewPetModal(false);
              setAddNewPetModal(true);
            }}
            onClose={() => {
              setConfirmAddNewPetModal(false);
            }}
            onOk={() => {
              submitPetHandle(
                petName,
                petYear,
                petMonth,
                petType,
                petSex,
                petBreed,
                userData[0]?.User_UID,
                userData[0]?.User_Email,
                userData[0]?.User_Name
              );
              setConfirmAddNewPetModal(false);
              window.location.reload();
            }}
          >
            <h1 className="font-montserrat font-bold text-[#393939]">
              Please confirm your pet&#39; information.
            </h1>
            <h1 className="font-montserrat text-[#393939] my-2">
              Pet Name:{" "}
              <span className="font-bold text-[#006B95] ml-1">{petName}</span>
            </h1>
            <h1 className="font-montserrat text-[#393939]  mb-2">
              Pet Age:{" "}
              <span className="font-bold text-[#006B95] ml-1">
                {petYear} Year{`(s)`} and {petMonth} Month{`(s)`} old
              </span>
            </h1>
            <h1 className="font-montserrat text-[#393939]  mb-2">
              Pet Type:{" "}
              <span className="font-bold text-[#006B95] ml-1">{petType}</span>
            </h1>
            <h1 className="font-montserrat text-[#393939]  mb-2">
              Pet Sex:{" "}
              <span className="font-bold text-[#006B95] ml-1">{petSex}</span>
            </h1>
            <h1 className="font-montserrat text-[#393939]  mb-2">
              Pet Breed:{" "}
              <span className="font-bold text-[#006B95] ml-1">{petBreed}</span>
            </h1>
          </Modal>
        </div>

        {appointment.length > 0 ? (
          <h1 className="mb-5 font-montserrat font-bold text-[#393939] text-2xl">
            Latest Appointments
          </h1>
        ) : (
          <h1 className="font-montserrat font-bold text-[#393939] text-2xl">
            You have no appointment yet
          </h1>
        )}
        <div className="mt-5 bg-white drop-shadow-md rounded-xl p-4">
          {appointment?.length > 0 ? (
            appointment?.slice(0, 1).map((data) => {
              return (
                <div
                  key={data?.id}
                  className="h-14 w-full flex justify-between"
                >
                  <div className="flex flex-row items-center gap-5">
                    <h1 className="h-16 w-16 rounded-full bg-white drop-shadow-md text-xs flex items-center justify-center text-center">
                      Image of {data?.Appointment_PatientPetName}
                    </h1>
                    <div className="flex flex-col ">
                      <h1 className="font-montserrat font-bold text-lg text-[#393939]">
                        {data?.Appointment_PatientPetName}
                      </h1>
                      <h1 className="font-montserrat font-bold text-lg text-[#096F85]">
                        Dr. {data?.Appointment_DoctorName}
                      </h1>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <h1 className="px-4 py-1 rounded-lg bg-[#ACE8F5] text-[#096F85] font-hind">
                      {data?.Appointment_Date?.format("MMMM DD, YYYY")}
                    </h1>
                  </div>
                </div>
              );
            })
          ) : (
            <h1></h1>
          )}
        </div>

        <Link
          href="/Appointments"
          className="w-fit mt-8 px-6 py-2 font-montserrat font-bold text-white bg-[#006B95] rounded-md place-self-end"
        >
          Set New Appointments{" "}
          <span className="ml-2">
            <FontAwesomeIcon icon={faPlus} />
          </span>
        </Link>

        <div className="mt-8">
          <h1 className="text-[#393939] font-montserrat font-bold text-2xl">
            Latest Bookings
          </h1>

          {boardDetails.length > 0 ? (
            <div>
              {boardDetails?.map((data) => {
                return (
                  <div key={data?.boardId}>
                    {data?.BC_BoarderCheckInDate?.format("MMMM DD, YYYY")}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-[218px] bg-white rounded-lg drop-shadow-md p-4 py-24 text-center font-montserrat font-bold text-2xl">
              You have not booked yet
            </div>
          )}
        </div>
        <Link
          href="/Booking"
          className="w-fit mt-8 px-6 py-2 font-montserrat font-bold text-white bg-[#006B95] rounded-md place-self-end"
        >
          Set New Bookings
          <span className="ml-2">
            <FontAwesomeIcon icon={faPlus} />
          </span>
        </Link>
        <h1 className="text-[#393939] text-2xl font-montserrat font-bold mt-8">
          Latest Orders
        </h1>
        <div className="mt-8 bg-white drop-shadow-lg rounded-xl p-4  ">
          <div className="grid grid-cols-5">
            <h1
              className={`${
                rated ? `col-span-2` : `col-span-3`
              } text-[#393939] font-medium font-hind text-xl`}
            >
              Product
            </h1>
            <h1
              className={`text-center text-[#393939] font-medium font-hind text-xl`}
            >
              Qty.
            </h1>
            <h1
              className={`text-center text-[#393939] font-medium font-hind text-xl`}
            >
              Status
            </h1>
            <h1
              className={`${
                rated ? `block` : `hidden`
              } text-center text-[#393939] font-medium font-hind text-xl`}
            >
              Rated
            </h1>
            <h1 className="col-span-5 h-0.5 bg-gray-500 rounded-full my-4"></h1>
            {listOfOrders.length > 0 ? (
              listOfOrders.slice(0, 3).map((data) => {
                return (
                  <div
                    key={data?.id}
                    className="relative col-span-5 grid grid-cols-5 h-fit p-8 gap-5 border-b-[1px] border-gray-400 mb-2"
                  >
                    <div className="text-center font-montserrat font-medium text-lg pt-4">
                      Image Of {data?.OC_Products?.OC_ProductName}
                    </div>
                    <div className={`${rated ? `col-span-1` : `col-span-2`}`}>
                      <h1 className="font-hind font-bold text-[#006B95]">
                        {data?.OC_SellerFullName}
                      </h1>
                      <h1 className="font-montserrat font-bold text-[#393939] mb-4">
                        {data?.OC_Products?.OC_ProductName}
                      </h1>
                      <h1 className="font-hind text-xl">
                        Total: Php {data?.OC_TotalPrice}
                      </h1>
                    </div>
                    <h1 className="text-center my-auto font-hind text-[#232323] text-xl font-semibold">
                      {data?.OC_Products?.OC_ProductQuantity}
                    </h1>
                    <h1 className="text-center my-auto capitalize font-hind text-[#232323] text-xl font-semibold">
                      {data?.OC_Status}
                    </h1>
                    <h1
                      className={`${
                        data?.OC_RatingAndFeedback?.rating === null
                          ? `hidden`
                          : ``
                      }text-center my-auto`}
                    >
                      <Rate
                        defaultValue={data?.OC_RatingAndFeedback?.rating}
                        disabled
                        className={`${
                          data?.OC_RatingAndFeedback?.rating === null
                            ? `hidden`
                            : ``
                        }text-center my-auto`}
                      />
                    </h1>
                    <Link
                      href={`/pc/cart/${data?.id}`}
                      className="absolute right-4 top-2 text-[#006B95] italic "
                    >
                      Click to show more details
                    </Link>
                  </div>
                );
              })
            ) : (
              <h1 className="text-[#393939] font-montserrat font-bold">
                You have no ordered{" "}
              </h1>
            )}
          </div>
        </div>
        <Link
          href="/Shopping"
          className="w-fit mt-8 px-6 py-2 font-montserrat font-bold text-white bg-[#006B95] rounded-md place-self-end"
        >
          Place New Order
          <span className="ml-2">
            <FontAwesomeIcon icon={faPlus} />
          </span>
        </Link>
      </div>
    </div>
  );
}
