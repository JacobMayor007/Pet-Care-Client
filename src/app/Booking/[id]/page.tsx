"use client";
import ClientNavbar from "@/app/ClientNavbar/page";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import "@ant-design/v5-patch-for-react-19";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/app/firebase/config";
import { format } from "date-fns";
import dayjs, { Dayjs } from "dayjs";
import Image from "next/image";
import { DatePicker, TimePicker } from "antd";
import {
  doc,
  DocumentData,
  getDoc,
  Timestamp,
  where,
  query,
  collection,
  getDocs,
  addDoc,
} from "firebase/firestore";
import Select from "react-select";
import { MultiValue } from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDirections } from "@fortawesome/free-solid-svg-icons";
import { Modal } from "antd";

interface Room {
  id?: string;
  Renter_CreatedAt?: Timestamp | string;
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
  Renter_UserEmail?: string;
}

// interface myReservation {
//   BC_BoarderStatus?: string;
// }

interface RoomID {
  params: Promise<{ id: string }>;
}

interface Feature {
  id: string;
  name: string;
  price: string;
}

interface Option {
  value: string;
  label: string;
  name: string;
}

export default function Room({ params }: RoomID) {
  const { id } = React.use(params);

  const [selectedFeatures, setSelectedFeatures] = useState<Option[]>([]);
  const handleChange = (selectedOptions: MultiValue<Option>) => {
    setSelectedFeatures(selectedOptions as Option[]);
  };
  const [restrictions, setRestrictions] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [room, setRoom] = useState<Room | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>();
  const [typeOfPayment, setTypeOfPayment] = useState("");
  const [userData, setUserData] = useState<DocumentData[]>([]);
  const [checkInDate, setCheckInDate] = useState<Dayjs | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Dayjs | null>(null);
  const [checkInTime, setCheckInTime] = useState<Dayjs | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<Dayjs | null>(null);
  const [guest, setGuest] = useState<number | null>(0);
  const [days, setDays] = useState<number | null>(0);
  const [roomID, setRoomID] = useState<string | null>("");
  const [roomStatus, setRoomStatus] = useState("");

  const [typeOfPaymentArray, setTypeOfPaymentArray] = useState<string[] | null>(
    null
  );
  const [userUID, setUserUID] = useState("");
  const router = useRouter();

  useEffect(() => {
    console.log("userEmail:", userEmail);
    console.log("userId:", userUID);

    const fetchUserData = async () => {
      try {
        if (userEmail && userUID) {
          // Query the Users collection with both conditions
          const userQuery = query(
            collection(db, "Users"),
            where("User_Email", "==", userEmail),
            where("User_UID", "==", userUID)
          );

          // Execute the query
          const querySnapshot = await getDocs(userQuery);

          if (!querySnapshot.empty) {
            // Extract all fields for the matching document(s)
            const userData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            setUserData(userData);
          } else {
            console.log("No matching user found.");
          }
        } else {
          console.log("userEmail or userId is missing");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userEmail, userUID]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        setUserUID(user.uid);
      } else {
        router.push("/Login");
      }
    });

    return () => unsubscribe();
  });

  const calculateDays = (
    checkIn: Dayjs | null,
    checkOut: Dayjs | null
  ): number => {
    if (!checkIn || !checkOut) return 0;
    return checkOut.diff(checkIn, "day");
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCheckInDate = localStorage.getItem("Check In Date");
      const storedCheckOutDate = localStorage.getItem("Check Out Date");
      const storedCheckInTime = localStorage.getItem("Check In Time");
      const storedCheckOutTime = localStorage.getItem("Check Out Time");
      const storedRoomID = localStorage.getItem("Room ID");
      const storedDays = Number(localStorage.getItem("Days"));
      const storedGuests = Number(localStorage.getItem("Guest"));

      const parsedCheckInDate =
        storedCheckInDate && storedCheckInDate !== "undefined"
          ? dayjs(JSON.parse(storedCheckInDate))
          : null;

      const parsedCheckOutDate =
        storedCheckOutDate && storedCheckOutDate !== "undefined"
          ? dayjs(JSON.parse(storedCheckOutDate))
          : null;
      const parsedCheckInTime =
        storedCheckInTime && storedCheckInTime !== "undefined"
          ? dayjs(JSON.parse(storedCheckInTime as string))
          : null;

      const parsedCheckOutTime =
        storedCheckOutTime && storedCheckOutTime !== "undefined"
          ? dayjs(JSON.parse(storedCheckOutTime as string))
          : null;

      setRoomID(storedRoomID);
      console.log("Room ID on local storage", storedRoomID);
      setCheckInDate(parsedCheckInDate);
      setCheckOutDate(parsedCheckOutDate);
      setCheckInTime(parsedCheckInTime);
      setCheckOutTime(parsedCheckOutTime);
      setDays(storedDays);
      setGuest(storedGuests);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("Check In Date", JSON.stringify(checkInDate));
      localStorage.setItem("Check Out Date", JSON.stringify(checkOutDate));
      localStorage.setItem("Check In Time", JSON.stringify(checkInTime));
      localStorage.setItem("Check Out Time", JSON.stringify(checkOutTime));
      localStorage.setItem("Room ID", roomID || "");

      // Make sure guests is a number before saving
      localStorage.setItem("Guest", guest?.toString() || "");

      // Calculate and store the number of days
      const countedDays = calculateDays(
        checkInDate ? dayjs(checkInDate) : null,
        checkOutDate ? dayjs(checkOutDate) : null
      );

      localStorage.setItem("Days", countedDays.toString());
    }
  }, [checkInDate, checkOutDate, checkInTime, checkOutTime, guest, roomID]);

  const formatTime = (date: Dayjs | null): string => {
    if (!date) return "";

    const dayjsDate = dayjs(date);

    if (!dayjsDate.isValid()) {
      return "Invalid Time";
    }

    const formattedTime = dayjsDate.format("h:mm A");
    return formattedTime;
  };

  const calculatedTime = (
    checkIn: Dayjs | null,
    checkOut: Dayjs | null
  ): number => {
    if (!checkIn || !checkOut) return 0;
    const checkInTime = dayjs(checkIn);
    const checkOutTime = dayjs(checkOut);

    if (!checkInTime.isValid() || !checkOutTime.isValid()) {
      return 0;
    }

    const diffInHours = checkOutTime.diff(checkInTime, "hour", true);
    return diffInHours >= 1 ? Math.ceil(diffInHours / 24) : 0;
  };

  const formattedCheckInTime = formatTime(checkInTime);
  const formattedCheckOutTime = formatTime(checkOutTime);

  const timeCalculated = calculatedTime(checkInTime, checkOutTime);

  const fetchRoomById = async (id: string) => {
    try {
      setLoadingPage(true);

      const docRef = doc(db, "board", id); // Replace "products" with your collection name
      const docSnap = await getDoc(docRef);

      console.log("Room: ", docSnap);

      if (docSnap.exists()) {
        // Spread all fields into the Product type and update state
        const fetchedRoom = { id: docSnap.id, ...docSnap.data() } as Room;
        setRoom(fetchedRoom);
        if (typeof fetchedRoom.Renter_PaymentMethod === "string") {
          setTypeOfPaymentArray(
            fetchedRoom.Renter_PaymentMethod.split(/\s*,\s*/)
          );
        } else if (Array.isArray(fetchedRoom.Renter_PaymentMethod)) {
          setTypeOfPaymentArray(fetchedRoom.Renter_PaymentMethod);
        } else {
          setTypeOfPaymentArray([]);
        }
      } else {
        setRoom(null);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setRoom(null);
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRoomById(id); // Fetch room based on the ID from the link
    }
  }, [id]);

  const handleSubmitRoom = async () => {
    const fullName = userData[0]?.User_Name;
    const boarderID = userData[0]?.User_UID;

    try {
      setLoadingPage(true);
      const roomRef = collection(db, "boarders");

      const addRef = await addDoc(roomRef, {
        BC_BoarderUID: boarderID,
        BC_BoarderFullName: fullName,
        BC_BoarderEmail: userEmail,
        BC_BoarderBoardedAt: Timestamp.now(),
        BC_BoarderCheckInTime: checkInTime
          ? Timestamp.fromDate(dayjs(checkInTime).toDate())
          : null,
        BC_BoarderCheckOutTime: checkOutTime
          ? Timestamp.fromDate(dayjs(checkOutTime).toDate())
          : null,
        BC_BoarderCheckInDate:
          checkInDate && dayjs(checkInDate).isValid()
            ? Timestamp.fromDate(dayjs(checkInDate).toDate())
            : null,

        BC_BoarderCheckOutDate:
          checkOutDate && dayjs(checkOutDate).isValid()
            ? Timestamp.fromDate(dayjs(checkOutDate).toDate())
            : null,
        BC_BoarderChoiceFeature: selectedFeatures,
        BC_BoarderDays: days,
        BC_BoarderDietaryRestrictions: restrictions,
        BC_BoarderGuest: guest,
        BC_BoarderStatus: "Pending",
        BC_BoarderUpdated: Timestamp.now(),
        BC_BoarderTypeRoom: room?.Renter_TypeOfRoom,
        BC_RenterRoomID: room?.id,
        BC_RenterFullName: room?.Renter_UserFullName,
        BC_RenterUID: room?.Renter_UserID,
        BC_RenterRoomName: room?.Renter_RoomName,
        BC_RenterPrice: room?.Renter_RoomPrice,
        BC_RenterLocation: room?.Renter_Location,
        BC_RenterEmail: room?.Renter_UserEmail,
        BC_TypeOfPayment: typeOfPayment,
      });

      console.log("Document ID of Adding boarder", addRef.id);

      const notifRef = collection(db, "notifications");
      addDoc(notifRef, {
        boardID: addRef.id,
        createdAt: Timestamp.now(),
        receiverID: room?.Renter_UserID,
        hide: false,
        message: `${fullName} wants to reserve a room ${room?.Renter_RoomName}`,
        senderID: boarderID,
        open: false,
        status: "unread",
        title: `Room Reservation with ${fullName}`,
        type: "Booking",
        sender_Fullname: fullName,
        receiver_Fullname: room?.Renter_UserFullName,
      });

      window.location.reload();
    } catch (error) {
      console.error("There is an error on adding Boarder", error);
    } finally {
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    const getMyStatus = async () => {
      const userUID = userData[0]?.User_UID;
      const docRef = collection(db, "boarders");
      const q = query(
        docRef,
        where("BC_RenterRoomID", "==", id),
        where("BC_BoarderUID", "==", userUID)
      );
      const result = await getDocs(q);
      if (!result.empty) {
        const status = result.docs.map((doc) => ({
          BC_BoarderStatus: doc.get("BC_BoarderStatus"),
        }));
        setRoomStatus(status[0]?.BC_BoarderStatus);
      } else {
        setRoomStatus("");
      }
    };
    getMyStatus();
  }, [id, userData, roomStatus]);

  const features: Feature[] = room?.Renter_RoomFeatures
    ? JSON.parse(room?.Renter_RoomFeatures)
    : [];

  const options = features.map((feature: Feature) => ({
    value: feature.price,
    name: feature.name,
    label: `${feature.name} - Php ${feature.price}`,
  }));

  if (loadingPage) {
    return <LoadingPage />;
  }

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

  const formatDate = (date: Dayjs | null): string => {
    if (!date) return "";
    const dayjsDate = dayjs(date);
    if (!dayjsDate.isValid()) {
      return "";
    }

    const month = dayjsDate.format("MMMM"); // Full month name
    const day = dayjsDate.format("D"); // Day of the month
    const year = dayjsDate.format("YYYY"); // Year
    return `${month} ${day}, ${year}`;
  };

  const formattedCheckIn = formatDate(checkInDate);
  const formattedCheckOut = formatDate(checkOutDate);

  console.log("Value of Room Status: ", roomStatus.valueOf());

  return (
    <div className={loadingPage ? `invisible` : `visible`}>
      <nav className="relative z-20">
        <ClientNavbar />
      </nav>

      <div className="mx-44 gap-4 mt-8 z-10">
        <div className=" grid grid-cols-2 gap-4">
          <div>
            <h1 className="font-montserrat text-base text-[#565656] font-bold">
              {room?.Renter_RoomName}
            </h1>
            <h1 className="font-montserrat text-2xl font-bold">
              {room?.Renter_TypeOfRoom}
            </h1>
          </div>
          <div className="flex justify-end">
            <a className="font-hind text-base font-bold text-end text-[#006B95]">
              Leave a Review
            </a>
          </div>
          <div className="h-96 flex justify-center items-center bg-white rounded-2xl drop-shadow-2xl">
            <h1 className="font-montserrat text-xl font-bold">
              Image of room {room?.Renter_RoomName}
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-center items-center bg-white rounded-2xl drop-shadow-2xl">
              <h1 className="font-montserrat text-xl font-bold">
                Image of room {room?.Renter_RoomName}
              </h1>
            </div>
            <div className="flex justify-center items-center bg-white rounded-2xl drop-shadow-2xl">
              <h1 className="font-montserrat text-xl font-bold">
                Image of room {room?.Renter_RoomName}
              </h1>
            </div>
            <div className="flex justify-center items-center bg-white rounded-2xl drop-shadow-2xl">
              <h1 className="font-montserrat text-xl font-bold">
                Image of room {room?.Renter_RoomName}
              </h1>
            </div>
            <div className="flex justify-center items-center bg-white rounded-2xl drop-shadow-2xl">
              <h1 className="font-montserrat text-xl font-bold">
                Image of room {room?.Renter_RoomName}
              </h1>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 h-full mt-4">
          <div className="col-span-2">
            <div className="flex flex-row gap-4 m-4 items-center">
              <div className="h-20 w-20 rounded-full drop-shadow-xl bg-white flex flex-row justify-center items-center">
                <h1 className="text-xs font-hind text-center">
                  Image of {room?.Renter_UserFullName}
                </h1>
              </div>
              <div>
                <h1 className="font-hind text-base font-bold">
                  Hosted by: {room?.Renter_UserFullName}
                </h1>
                <p className="font-hind text-base font-normal">
                  Posted available on:{" "}
                  {room?.Renter_CreatedAt
                    ? (() => {
                        try {
                          // Handle Timestamp or string
                          const date =
                            typeof room.Renter_CreatedAt === "object" &&
                            "toDate" in room.Renter_CreatedAt
                              ? room.Renter_CreatedAt.toDate()
                              : new Date(room.Renter_CreatedAt);
                          return format(date, "MMMM dd, yyyy");
                        } catch (error) {
                          console.error("Error parsing date:", error);
                          return "Invalid date";
                        }
                      })()
                    : "Date not available"}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl font-hind">Description</h1>
              <p className="font-hind text-base leading-7">
                {room?.Renter_RoomDescription}
              </p>

              <div className="grid grid-cols-3 gap-2 my-3 mr-3 bg-white drop-shadow-lg pl-5 pr-1 py-10 rounded-xl">
                {typeOfPaymentArray?.map((data, index) => {
                  return (
                    <div
                      key={index}
                      className="flex flex-row items-center gap-2 "
                    >
                      <input
                        type="radio"
                        name="payment-method"
                        id={data}
                        value={data}
                        checked={typeOfPayment === data}
                        onChange={() => setTypeOfPayment(data)}
                        className="cursor-pointer"
                      />
                      <Image
                        src={`/${data} Image.svg`}
                        height={30}
                        width={30}
                        alt={data}
                      />
                      <label
                        htmlFor={data}
                        className="font-montserrat font-semibold text-base cursor-pointer"
                      >
                        {data}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mt-4 ">
            <div className="flex flex-col w-full bg-[#86B2B4] rounded-2xl h-[444px] ">
              <h1 className="font-montserrat font-bold text-3xl text-white m-4">
                Php {room?.Renter_RoomPrice}{" "}
                <span className="font-montserrat text-xl font-normal">
                  / day
                </span>
              </h1>
              <div className="bg-[#DEE9E9] grid grid-cols-2 mx-4 rounded-xl">
                <div className="border-r-2 border-[#787E7E] py-3 pr-2 ml-3">
                  <p className="font-bold font-hind text-[#4E5656]">Check In</p>
                  {formattedCheckIn !== "" ? (
                    <h1 className="font-hind text-[#4E5656]">
                      {formattedCheckIn}
                    </h1>
                  ) : (
                    <DatePicker
                      needConfirm
                      onChange={checkInChange}
                      className="border-none outline-none drop-shadow-none bg-transparent hover:bg-transparent "
                    />
                  )}
                  {formattedCheckInTime !== "" ? (
                    <p className="font-hind text-[#4E5656] text-sm font-medium">
                      {formattedCheckInTime}
                    </p>
                  ) : (
                    <TimePicker
                      use12Hours
                      onChange={checkInTimeChange}
                      format="h:mm a"
                      className="border-none outline-none drop-shadow-none bg-transparent hover:bg-transparent"
                    />
                  )}
                </div>
                <div className="py-3 ml-3">
                  <p className="font-bold font-hind text-[#4E5656]">
                    Check Out
                  </p>
                  {formattedCheckOut !== "" ? (
                    <h1 className="font-hind text-[#4E5656]">
                      {formattedCheckOut}
                    </h1>
                  ) : (
                    <DatePicker
                      needConfirm
                      onChange={checkOutChange}
                      className="border-none outline-none drop-shadow-none bg-transparent hover:bg-transparent "
                    />
                  )}
                  {formattedCheckOutTime !== "" ? (
                    <p className="font-hind text-[#4E5656] text-sm font-medium">
                      {formattedCheckOutTime}
                    </p>
                  ) : (
                    <TimePicker
                      use12Hours
                      format="h:mm a"
                      onChange={checkOutTimeChange}
                      className="border-none outline-none drop-shadow-none bg-transparent hover:bg-transparent"
                    />
                  )}
                </div>
                <div className="border-b-2 col-span-2 border-[#787E7E]" />
                <div className="col-span-2 ml-3 py-2">
                  <h1 className="font-bold font-hind text-[#4E5656]">Guests</h1>
                  <input
                    type="number"
                    name="guests"
                    id="guestID"
                    value={guest == 0 ? `` : guest || 0}
                    className="rounded-lg px-2 h-7 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    onChange={(e) => setGuest(Number(e.target.value))}
                  />
                </div>
              </div>
              <button
                type="button"
                className="mx-4 h-12 mt-4 bg-blue-300 text-white font-montserrat text-xl font-bold rounded-lg"
                disabled={
                  roomStatus === "Pending" ||
                  roomStatus === "Accept" ||
                  roomStatus === "Checked-In" ||
                  roomStatus === "Reserved"
                    ? true
                    : false
                }
                onClick={() => {
                  setConfirm(true);
                }}
              >
                {roomStatus !== "Paid" && roomStatus ? roomStatus : `Book Now`}
              </button>
              <Modal
                open={confirm}
                onOk={() => {
                  handleSubmitRoom();
                  setConfirm(false);
                }}
                onCancel={() => setConfirm(false)}
                style={{
                  marginTop: "120px",
                }}
              >
                <p className="font-hind text-base">
                  Do you wish to book {room?.Renter_RoomName}?
                </p>
              </Modal>

              <div className="grid grid-cols-2 mx-4 mt-4 gap-2">
                <p className="font-hind text-base text-white">
                  Php {room?.Renter_RoomPrice} X {days} / days
                </p>
                <h1 className="text-end font-bold font-hind text-base text-white">
                  Php{" "}
                  {timeCalculated === 1 || timeCalculated > 1
                    ? Number(room?.Renter_RoomPrice) * 1
                    : Number(room?.Renter_RoomPrice) * Number(days)}
                </h1>
                <p className=" font-hind text-base text-white">Hosting Fee</p>
                <h1 className="font-bold font-hind text-base text-white text-end">
                  Php 100
                </h1>
                <h1 className="font-hind font-bold text-lg text-white text mt-2">
                  Total Price
                </h1>
                <p className="font-hind font-bold text-lg text-white text-end mt-2">
                  Php {Number(room?.Renter_RoomPrice) * Number(days) + 100}
                </p>
              </div>
            </div>
            <Select
              id="features"
              isMulti
              name="features"
              options={options}
              value={selectedFeatures}
              onChange={handleChange}
              getOptionLabel={(e) => e.label}
              getOptionValue={(e) => e.value}
              className="mt-2 cursor-pointer"
              placeholder="Select features"
              styles={{
                control: (provided) => ({
                  ...provided,
                  backgroundColor: "white",
                  borderRadius: "8px",
                  fontFamily: "Hind, sans-serif",
                  outlineColor: "white",
                  cursor: "pointer",
                  filter:
                    " drop-shadow(0 20px 13px rgb(0 0 0 / 0.03)) drop-shadow(0 8px 5px rgb(0 0 0 / 0.08));",
                }),
                multiValue: (provided) => ({
                  ...provided,
                  backgroundColor: "white",
                  fontFamily: "Hind, sans-serif", // Use Hind font here
                  outlineColor: "white",
                }),
              }}
            />

            <div className="mt-4">
              <label
                htmlFor="dietary-restrictions"
                className="font-montserrat font-bold text-xl text-[#262626]"
              >
                Dietary Restrictions
              </label>
              <input
                value={restrictions}
                onChange={(e) => setRestrictions(e.target.value)}
                type="text"
                name="restrictions"
                id="dietary-restrictions"
                className="h-12 w-full outline-none p-2 font-hind text-black items-center text-lg bg-white rounded-xl drop-shadow-xl"
                placeholder="Ex. Peanuts, Chocolate, Eggplant"
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-8 my-8 ">
          <h1 className="col-span-3 text-4xl font-hind ">Where To Find?</h1>
          <div className="col-span-2 flex justify-center items-center h-44 bg-white rounded-xl drop-shadow-xl">
            Image Location of {room?.Renter_Location}
          </div>
          <div className=" flex flex-col justify-between py-2">
            <h1 className="font-montserrat font-bold text-base">
              Location name of the board
            </h1>
            <p className="font-montserrat">{room?.Renter_Location}</p>

            <div>
              <a
                href={`https://www.google.com/maps?q=${encodeURIComponent(
                  room?.Renter_Location || ""
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-montserrat font-bold text-lg text-white bg-blue-800 rounded-full py-4 px-12 active:scale-95 ease-in-out transition-all duration-75 transform"
              >
                <span>
                  <FontAwesomeIcon icon={faDirections} />
                </span>{" "}
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingPage() {
  return (
    <div className="bg-slate-100 pt-4">
      <nav className="mx-44 gap-8 h-full flex flex-row items-center  animate-pulse">
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
      <div className="mx-44 gap-4 mt-8 animate-pulse">
        <div className=" grid grid-cols-2 gap-4">
          <div>
            <h1 className="font-montserrat text-base text-[#565656] font-bold"></h1>
            <h1 className="font-montserrat text-2xl font-bold"></h1>
          </div>
          <div className="flex justify-end">
            <a className="font-hind text-base font-bold text-end text-[#006B95]"></a>
          </div>
          <div className="h-96 flex justify-center items-center font-montserrat text-xl font-bold bg-slate-300 rounded-2xl drop-shadow-2xl">
            <h1 className="font-montserrat text-xl font-bold"></h1>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex justify-center items-center bg-slate-300 rounded-2xl drop-shadow-2xl">
              <h1 className="font-montserrat text-xl font-bold"></h1>
            </div>
            <div className="flex justify-center items-center bg-slate-300 rounded-2xl drop-shadow-2xl">
              <h1 className="font-montserrat text-xl font-bold"></h1>
            </div>
            <div className="flex justify-center items-center bg-slate-300 rounded-2xl drop-shadow-2xl">
              <h1 className="font-montserrat text-xl font-bold"></h1>
            </div>
            <div className="flex justify-center items-center bg-slate-300 rounded-2xl drop-shadow-2xl">
              <h1 className="font-montserrat text-xl font-bold"></h1>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 h-full mt-4 animate-pulse">
          <div className="col-span-2">
            <div className="flex flex-row gap-4 m-4 items-center">
              <div className="h-20 w-20 rounded-full drop-shadow-xl bg-slate-300 flex flex-row justify-center items-center">
                <h1 className="text-xs font-hind text-center"></h1>
              </div>
              <div>
                <h1 className="font-hind text-base font-bold"></h1>
                <p className="font-hind text-base font-normal"> </p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl font-hind"></h1>
              <p className="font-hind text-base leading-7"></p>

              <div className="grid grid-cols-3 gap-2 mt-10 mx-8 bg-slate-300 drop-shadow-lg pl-5 py-10 rounded-xl"></div>
            </div>
          </div>
          <div className="mt-4 animate-pulse">
            <div className="flex flex-col w-full bg-slate-300 drop-shadow-xl rounded-2xl h-[444px] ">
              <h1 className="font-montserrat font-bold text-3xl text-white m-4"></h1>
              <div className="bg-slate-200 grid grid-cols-2 mx-4 rounded-xl">
                <div className="border-r-2 border-slate-300 pt-3 ml-3">
                  <p className="font-bold font-hind text-[#4E5656]"> </p>
                  <h1 className="font-hind text-[#4E5656]"></h1>
                  <p className="font-hind text-[#4E5656] text-sm font-medium"></p>
                </div>
                <div className="py-3 ml-3">
                  <p className="font-bold font-hind text-[#4E5656]"></p>
                  <h1 className="font-hind text-[#4E5656]"></h1>
                  <p className="font-hind text-[#4E5656] text-sm font-medium"></p>
                </div>
                <div className="border-b-2 col-span-2 border-slate-300" />
                <div className="col-span-2 ml-3 py-2">
                  <h1 className="font-bold font-hind text-[#4E5656]"></h1>
                  <p className="font-hind text-[#4E5656]"> </p>
                </div>
              </div>
              <button
                type="button"
                className="mx-4 h-12 mt-4 bg-slate-200 text-white font-montserrat text-xl font-bold rounded-lg"
              ></button>
              <div className="grid grid-cols-2 mx-4 mt-4 gap-2">
                <p className="font-hind text-base text-white"></p>
                <h1 className="text-end font-bold font-hind text-base text-white"></h1>
                <p className=" font-hind text-base text-white"></p>
                <h1 className="font-bold font-hind text-base text-white text-end"></h1>
                <h1 className="font-hind font-bold text-lg text-white text mt-2"></h1>
                <p className="font-hind font-bold text-lg text-white text-end mt-2"></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
