"use client";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Signout from "../SignOut/page";
import { useRouter } from "next/navigation";
import { faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import * as Notifications from "../fetchData/fetchNotifications";
import {
  UserOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  BellOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import fetchUserData from "../fetchData/fetchUserData";
import { Modal } from "antd";
import { getMyPets } from "../Profile/[id]/myData";
import {
  collection,
  DocumentData,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import dayjs, { Dayjs } from "dayjs";
import { db } from "../firebase/config";

interface Notifications {
  id?: string;
  createdAt?: string;
  appointment_ID?: string;
  order_ID?: string;
  room_ID?: string;
  message?: string;
  sender?: string;
  receiver?: string;
  status?: string;
  open?: boolean;
  title?: string;
  type?: string;
  hide?: boolean;
}

interface MatchingNotifications {
  id?: string;
  hide?: boolean;
  open?: boolean;
  message?: string;
  receiverEmail?: string[];
  receiverUid?: string[];
  senderEmail?: string;
  status?: string;
  timestamp?: Dayjs | null;
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

export default function ClientNavbar() {
  const btnRef = useRef<HTMLDivElement | null>(null);
  const [myPets, setMyPets] = useState<MyPets[]>([]);
  const [userData, setUserData] = useState<DocumentData[]>([]);
  const [logout, setLogout] = useState(false);
  const auth = getAuth();
  const router = useRouter();
  const [showNotif, setShowNotif] = useState(false);
  const [dropDown, setDropDown] = useState(false);
  const [unopenNotif, setUnopenNotif] = useState(0);
  const [userUID, setUserUID] = useState("");
  const [toMatchModal, setToMatchModal] = useState(false);

  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/Login");
      } else {
        setUserUID(user?.uid);
      }
    });
    return () => unsubscribe();
  });

  useEffect(() => {
    const getUserData = async () => {
      const result = await fetchUserData();
      setUserData(result);
      setUserEmail(result[0]?.User_Email);
    };
    getUserData();
  }, []);

  useEffect(() => {
    const closeNotification = (e: MouseEvent) => {
      if (!btnRef.current?.contains(e.target as Node)) {
        setShowNotif(false);
        setDropDown(false);
        setLogout(false);
      }
    };

    document.body.addEventListener("mousedown", closeNotification);

    return () => {
      document.body.removeEventListener("mouseover", closeNotification);
    };
  }, [showNotif]);

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
    let unsubscribe: () => void;

    const getUnopenNotifications = async () => {
      try {
        const data = await fetchUserData();
        const userUID = data[0]?.User_UID;

        if (!userUID) {
          console.log("Logged In First");
          return;
        }

        unsubscribe = Notifications.UnopenNotification(userUID, (newNotif) => {
          setUnopenNotif(newNotif.length);
        });
      } catch (error) {
        console.log(error);
      }
    };

    getUnopenNotifications();

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const latestChats = async () => {
    try {
      if (!userEmail) {
        console.error("User UID is not defined.");
        return;
      }

      console.log(userEmail);

      const docRef = collection(db, "chats");
      const q = query(
        docRef,
        where("participants", "array-contains", userEmail)
      );
      const docSnap = await getDocs(q);

      if (docSnap.empty) {
        console.log("No chats found.");
        router.push("/Message");
      } else {
        const otherUser = docSnap.docs.map((doc) => {
          const chatData = doc.data();
          const otherUserEmail = chatData.participants.find(
            (email: string) => email !== userEmail
          );
          return otherUserEmail;
        });

        const otherUserEmail = otherUser[0];

        const userRef = collection(db, "Users");
        const userQ = query(userRef, where("User_Email", "==", otherUserEmail));
        const userSnap = await getDocs(userQ);

        let otherID: string = "";
        if (!userSnap.empty) {
          otherID = userSnap.docs[0].id;
        }

        router.push(`/Message/${otherID}`);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  return (
    <nav className="h-20 flex flex-row justify-center items-center">
      <div className="flex items-center justify-center gap-16 px-14 w-full">
        <div className="flex items-center">
          <Image src="/Logo.svg" height={54} width={54} alt="Logo" />
          <h1 className="text-2xl font-sigmar font-normal text-[#006B95]">
            Pet Care
          </h1>
        </div>
        <ul className="list-type-none flex items-center gap-3">
          <li className="w-28 h-14 flex items-center justify-center">
            <Link
              href="/"
              className="font-montserrat text-base text-[#006B95] font-bold"
            >
              Dashboard
            </Link>
          </li>
          <li className="w-28 h-14 flex items-center justify-center">
            <Link
              href="/Booking"
              className="font-montserrat text-base text-[#006B95] font-bold"
            >
              Booking
            </Link>
          </li>
          <li className="w-28 h-14 flex items-center justify-center ">
            <Link
              href="/Shopping"
              className="font-montserrat text-base text-[#006B95] font-bold"
            >
              Shopping
            </Link>
          </li>
          <li className="w-28 h-14 flex items-center justify-center">
            <Link
              className="font-montserrat text-base text-[#006B95] font-bold"
              href="/Appointments"
            >
              Appointments
            </Link>
          </li>

          <li className="w-28 h-14 flex items-center justify-center">
            <div
              className="font-montserrat text-base text-[#006B95] font-bold cursor-pointer"
              onClick={() => {
                latestChats();
              }}
            >
              Inbox
            </div>
          </li>
        </ul>
        <div className="flex items-center gap-4" ref={btnRef}>
          <div className="relative  flex gap-2">
            <SearchOutlined className="text-[#006B95] font-bold text-lg cursor-pointer" />
            <BellOutlined
              className="text-[#006B95] font-bold"
              onClick={() => {
                setShowNotif((prev) => !prev);
                setLogout(logout === true ? false : logout);
                Notifications.openNotification(userUID || "");
              }}
            />
            <UserOutlined
              className="text-[#006B95] font-bold text-lg cursor-pointer"
              onClick={() => {
                setLogout((prev) => !prev);
                setShowNotif(false);
                setDropDown(false);
              }}
            />
            <ShoppingCartOutlined
              className="text-[#006B95] font-bold text-lg cursor-pointer"
              onClick={() => {
                setDropDown((prev) => !prev);
                setLogout(false);
                setShowNotif(false);
              }}
            />

            {dropDown ? (
              <nav className="absolute top-4 flex flex-col left-10 gap-2 bg-white drop-shadow-md p-4 rounded-md">
                <Link
                  href="/pc/cart"
                  className="font-montserrat font-bold text-[#006B95] text-sm"
                >
                  Cart
                </Link>
                <Link
                  href="/pc/room"
                  className="font-montserrat font-bold text-[#006B95] text-sm"
                >
                  Rooms
                </Link>
                <Link
                  href="/pc/schedule"
                  className="font-montserrat font-bold text-[#006B95] text-sm"
                >
                  Schedule
                </Link>
              </nav>
            ) : (
              <div className="hidden" />
            )}
            <div
              className={
                logout
                  ? `grid grid-rows-6 justify-center items-center bg-[#F3F3F3] drop-shadow-xl rounded-lg absolute top-10 -left-3 cursor-pointer h-fit w-56`
                  : `hidden`
              }
            >
              <Link
                href={`/Profile/${userUID}`}
                className="text-center font-hind  h-full w-44 flex items-center justify-center border-b-[1px] border-[#B1B1B1]"
              >
                My Profile
              </Link>
              <h1
                onClick={() => setToMatchModal(true)}
                className="text-center font-hind  h-full w-44 flex items-center justify-center border-b-[1px] border-[#B1B1B1]"
              >
                Find match to breed?
              </h1>
              <Link
                href={`/Doctor`}
                className="text-center font-hind  h-full w-44 flex items-center justify-center border-b-[1px] border-[#B1B1B1]"
              >
                Want to become part of our doctors?
              </Link>
              <Link
                href={`/Provider`}
                className="text-center font-hind  h-full w-44 flex items-center justify-center border-b-[1px] border-[#B1B1B1]"
              >
                Want to become part of our product sellers?
              </Link>
              <Link
                href={`/Renter`}
                className="text-center font-hind  h-full w-44 flex items-center justify-center border-b-[1px] border-[#B1B1B1]"
              >
                Want to become part of our renters?
              </Link>
              <Link
                href={`/Settings`}
                className="text-center font-hind  h-full w-44 flex items-center justify-center border-b-[1px] border-[#B1B1B1]"
              >
                Settings
              </Link>

              <Signout />
            </div>

            <div
              className={
                unopenNotif > 0
                  ? `h-4 w-4 bg-red-500 text-white absolute left-9 -top-2 rounded-full flex justify-center items-center text-xs font-hind`
                  : `hidden`
              }
            >
              {unopenNotif < 0 ? `` : unopenNotif}
            </div>
            <div
              className={
                showNotif
                  ? `flex absolute top-5 right-12 cursor-pointer transform-gpu ease-in-out duration-300`
                  : `hidden`
              }
              onClick={() => setShowNotif(false)}
            >
              <UserNotification />
            </div>
          </div>
        </div>
      </div>
      <Modal
        open={toMatchModal}
        onCancel={() => setToMatchModal(false)}
        onClose={() => () => setToMatchModal(false)}
        onOk={() => () => {
          setToMatchModal(false);
        }}
        footer={null}
      >
        <div className="gap-2 flex flex-col">
          <h1 className="font-montserrat font-medium text-[#393939] text-lg">
            Choose your pet to breed.
          </h1>
          <div className="flex flex-row justify-evenly">
            {myPets.length > 0 ? (
              myPets.map((data) => {
                return (
                  <div key={data?.id} className=" relative">
                    <Link
                      href={`/find-my-breeding-partner/${data?.id}`}
                      className=""
                    >
                      <Image
                        src={`/${data?.pet_name?.toLocaleLowerCase()}.jpg`}
                        height={105}
                        width={150}
                        alt={`${data?.pet_name} Image`}
                        className={`object-cover rounded-lg 
                            border-4 border-[#4ABEC5] cursor-pointer`}
                      />
                      <h1 className="absolute bottom-5 left-2 font-bold font-montserrat text-2xl  text-white max-w-32 overflow-hidden text-ellipsis text-nowrap">
                        {data?.pet_name}
                      </h1>
                    </Link>
                  </div>
                );
              })
            ) : (
              <div className="text-xl my-8 font-bold font-montserrat h-52 w-52 bg-white rounded-md drop-shadow-md flex items-center justify-center pt-4">
                You have no pets
              </div>
            )}
          </div>
        </div>
      </Modal>
    </nav>
  );
}

const UserNotification = () => {
  const [myNotification, setMyNotification] = useState<Notifications[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [myMatchingNotifications, setMyMatchingNotifications] = useState<
    MatchingNotifications[]
  >([]);

  const [userUID, setUserUID] = useState("");

  useEffect(() => {
    if (!userEmail) return; // Ensure userUID is valid

    const docRef = collection(db, "matching-notifications");
    const q = query(
      docRef,
      where("receiverEmail", "array-contains", userEmail)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const myMatchings = querySnapshot.docs.map(
        (doc) => doc.data() as MatchingNotifications
      );

      setMyMatchingNotifications(
        myMatchings.map((data) => ({
          ...data,
          receiverEmail: data.receiverEmail
            ? data.receiverEmail.filter((user) => user !== userEmail)
            : [],
          timestamp: data.timestamp ? dayjs(data.timestamp.toDate()) : null,
        }))
      );
    });

    return () => unsubscribe(); // Ensure cleanup
  }, [userEmail]);

  useEffect(() => {
    let unsubscribe: () => void;

    const getMyNotifications = async () => {
      try {
        const data = await fetchUserData();
        const userUID = data[0]?.User_UID;
        setUserEmail(data[0]?.User_Email);
        setUserUID(data[0]?.User_Email);
        if (!userUID) {
          console.log("Logged In First");

          return;
        }

        unsubscribe = Notifications.default(userUID, (newNotif) => {
          setMyNotification(newNotif);
        });
      } catch (error) {
        console.log(error);
      }
    };

    getMyNotifications();

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <div className="max-w-[500px] w-[482px] h-fit max-h-[542px] bg-white drop-shadow-lg rounded-xl justify-self-center flex flex-col  overflow-y-scroll">
      <h1 className="font-hind text-lg mx-4 mt-4 mb-2">Notifications</h1>
      <div className="h-0.5 border-[#393939] w-full border-[1px] mb-2" />
      {myMatchingNotifications.map((data, index) => {
        return (
          <div
            key={index}
            className=" drop-shadow-lg grid grid-cols-12 p-2 items-center"
          >
            <div className="m-2 h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            <div className="grid grid-cols-12 my-2 col-span-11">
              <div className="col-span-11 grid grid-cols-12">
                <div className="h-12 w-12 col-span-2 rounded-full bg-white drop-shadow-lg font-montserrat text-xs flex items-center justify-center text-center text-nowrap overflow-hidden">
                  Image of <br />
                  Pet
                </div>
                <div className="flex flex-col gap-1 font-montserrat text-wrap col-span-10 text-sm">
                  <h1 className="text-[#393939] font-medium">
                    {data?.message}
                  </h1>
                  <p className="text-xs text-[#797979]">
                    {data?.timestamp?.fromNow()}
                  </p>
                  <Link
                    href={`/Message/${data?.receiverUid?.find(
                      (uid: string) => uid !== userUID
                    )}`}
                    className="place-self-end p-2 rounded-md bg-[#006B95] text-white"
                  >
                    Send A Message
                  </Link>
                </div>
              </div>
              <div className="flex justify-center mt-0.5 ">
                <FontAwesomeIcon icon={faEyeSlash} />
              </div>
            </div>
          </div>
        );
      })}
      {myNotification.map((data, index) => {
        return (
          <div
            key={index}
            className=" drop-shadow-lg grid grid-cols-12 p-2 items-center"
          >
            <div className="m-2 h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            <div className="grid grid-cols-12 my-2 col-span-11">
              <Link
                href={`/pc/${
                  data?.appointment_ID
                    ? `schedule/${data.appointment_ID}`
                    : data?.order_ID
                    ? `cart/${data.order_ID}`
                    : `rooms/${data?.room_ID}`
                }`}
                className="col-span-11 grid grid-cols-12"
              >
                <div className="h-12 w-12 col-span-2 rounded-full bg-white drop-shadow-lg font-montserrat text-xs flex items-center justify-center text-center text-nowrap overflow-hidden">
                  Image of <br />
                  Pet
                </div>
                <div className="flex flex-col gap-1 font-montserrat text-wrap col-span-10 text-sm">
                  <h1 className="text-[#393939] font-medium">
                    {data?.message}
                  </h1>
                  <p className="text-xs text-[#797979]">{data?.createdAt}</p>
                </div>
              </Link>
              <div className="flex justify-center mt-0.5 ">
                <FontAwesomeIcon icon={faEyeSlash} />
              </div>
            </div>
            {data?.type === "Change Appointment" ? (
              <div className="flex flex-row justify-end gap-4 col-span-12 mr-10">
                <button
                  type="button"
                  className="bg-[#61C4EB] py-1 px-5 text-white rounded-lg"
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="bg-red-400 py-1 px-5 text-white rounded-lg"
                >
                  Reject
                </button>
              </div>
            ) : (
              <div className="hidden" />
            )}
          </div>
        );
      })}
    </div>
  );
};
