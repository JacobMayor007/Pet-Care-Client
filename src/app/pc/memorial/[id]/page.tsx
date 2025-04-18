"use client";

import dayjs, { Dayjs } from "dayjs";
import "@ant-design/v5-patch-for-react-19";
import ClientNavbar from "@/app/ClientNavbar/page";
import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import fetchUserData from "@/app/fetchData/fetchUserData";
import { db } from "@/app/firebase/config";
import { Modal, Rate } from "antd";
import React from "react";
import Loading from "@/app/Loading/page";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

interface MemorialAppointment {
  id?: string;
  memorial_service_createdAt?: Dayjs | null;
  memorial_service_date?: Dayjs | null;
  memorial_service_isNewCustomer?: string;
  memorial_service_mourner_email?: string;
  memorial_service_mourner_name?: string;
  memorial_service_mourner_id?: string;
  memorial_service_status?: string;
  memorial_service_payment?: string;
  memorial_service_petName?: string;
  memorial_service_provider_address?: string;
  memorial_service_provider_contact?: string;
  memorial_service_provider_email?: string;
  memorial_service_provider_fullname?: string;
  memorial_service_provider_id?: string;
  memorial_service_provider_memorial_name?: string;
  memorial_service_rate_and_feedback?: {
    feedback?: string;
    rate?: number;
  };
  memorial_service_type?: string;
}

interface MemorialID {
  params: Promise<{ id: string }>;
}

export default function MemorialTransactions({ params }: MemorialID) {
  const { id } = React.use(params);
  const [myMemorial, setMyMemorial] = useState<MemorialAppointment | null>(
    null
  );
  const [feedback, setFeedback] = useState("");

  const [userData, setUserData] = useState<DocumentData[]>([]);
  const [rateModal, setRateModal] = useState(false);
  const descriptor = ["terrible", "bad", "normal", "good", "wonderful"];
  const [star, setStar] = useState(0);
  const [loading, setLoading] = useState(true);
  const [successful, setSuccessful] = useState(false);
  useEffect(() => {
    const getUserData = async () => {
      const result = await fetchUserData();
      setUserData(result);
    };
    getUserData();
  }, []);

  useEffect(() => {
    const getMyMemorial = async () => {
      try {
        const docRef = doc(db, "mourners", id);

        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          const result = {
            id: docSnap.id,
            ...data,
            memorial_service_date: data?.memorial_service_date
              ? dayjs(data?.memorial_service_date.toDate())
              : null,
            memorial_service_createdAt: data?.memorial_service_createdAt
              ? dayjs(data?.memorial_service_createdAt.toDate())
              : null,
          } as MemorialAppointment;

          setMyMemorial(result);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getMyMemorial();
  }, [id]);

  const handleRate = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, "mourners", myMemorial?.id || "");
      const docSnap = await getDoc(docRef);
      const notifRef = collection(db, "notifications");

      if (docSnap.exists()) {
        await updateDoc(docRef, {
          memorial_service_rate_and_feedback: {
            rate: star,
            feedback: feedback,
          },
        });

        await addDoc(notifRef, {
          createdAt: Timestamp.now(),
          memorial_id: myMemorial?.id,
          receiverID: myMemorial?.memorial_service_provider_id,
          senderID: userData[0]?.User_UID,
          receiver_fullName: myMemorial?.memorial_service_provider_fullname,
          sender_fullname: userData[0]?.User_Name,
          message: `${
            userData[0]?.User_Name
          } has rated your memorial service at ${myMemorial?.memorial_service_date?.format(
            "MMMM DD, YYYY"
          )}`,
          open: false,
          status: "unread",
          hide: false,
          title: "memorial",
        });

        setSuccessful(true);

        const ordersRef = collection(db, "mourners");
        const q = query(
          ordersRef,
          where(
            "memorial_service_provider_id",
            "==",
            myMemorial?.memorial_service_provider_id
          )
        );
        const querySnapshot = await getDocs(q);

        const ratingArray: number[] = [];
        querySnapshot.forEach((doc) => {
          const memorialData = doc.data();
          const rating = memorialData.memorial_service_rate_and_feedback?.rate;

          if (typeof rating === "number") {
            ratingArray.push(rating);
          }
        });

        // Calculate the average rating
        let averageRating = 0;
        if (ratingArray.length > 0) {
          const total = ratingArray.reduce((sum, current) => sum + current, 0);
          averageRating = total / ratingArray.length;
        }

        const productRef = doc(
          db,
          "memorial",
          myMemorial?.memorial_service_provider_id || ""
        );
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          await updateDoc(productRef, {
            mortician_total_rating: Math.trunc(averageRating),
          });
          console.log(
            `Updated Mortician Total Rating for memorial collection ${myMemorial?.memorial_service_provider_id} to ${averageRating}`
          );
        } else {
          console.error(
            `Mortician with ID ${myMemorial?.memorial_service_provider_id} not found in 'memorial' collection.`
          );
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  console.log("Rate: ", star, "\nFeedback: ", feedback);

  if (successful) {
    setInterval(() => {
      setSuccessful(false);
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
    <div>
      <nav className="relative z-20">
        <ClientNavbar />
      </nav>
      <div className="mx-56 flex flex-col gap-5 my-16">
        <div className="rounded-xl drop-shadow-md bg-white h-56 grid grid-cols-4 gap-4">
          <div className="h-32 w-32 rounded-full border-[1px] capitalize font-montserrat font-bold text-2xl m-auto flex justify-center items-center border-slate-300">
            {myMemorial?.memorial_service_mourner_name?.charAt(0)}
          </div>
          <div className="flex flex-col justify-center col-span-2">
            <h1 className="font-montserrat font-bold capitalize text-lg text-[#393939]">
              Customer Name: {myMemorial?.memorial_service_mourner_name}
            </h1>
            <h1 className="font-montserrat capitalize text-lg text-[#393939]">
              On: {myMemorial?.memorial_service_date?.format("MMMM DD, YYYY")}
            </h1>
            <h1 className="font-montserrat ">
              Service Type:{" "}
              <span className="font-bold text-[#006B95] capitalize">
                {myMemorial?.memorial_service_type} Ceremony
              </span>
            </h1>
          </div>
          {myMemorial?.memorial_service_rate_and_feedback?.rate ? (
            <Rate
              className="m-auto"
              value={myMemorial?.memorial_service_rate_and_feedback.rate}
              disabled
            />
          ) : (
            <button
              onClick={() => setRateModal(true)}
              className="m-auto bg-[#006B95] w-52 h-12 rounded-md text-white  font-hind italic font-bold text-xl"
            >
              Click to rate service
            </button>
          )}
        </div>
      </div>

      <Modal
        open={rateModal}
        onCancel={() => setRateModal(false)}
        onClose={() => setRateModal(false)}
        onOk={() => {
          handleRate();
          setRateModal(false);
        }}
      >
        <h1 className="font-montserrat font-bold text-[#006B95]">
          Please rate the service of{" "}
          <span className="capitalize">
            {myMemorial?.memorial_service_provider_fullname}
          </span>
        </h1>
        <div className="">
          <label
            htmlFor="rateID"
            className="text-[#006B95] font-montserrat mr-10"
          >
            Rate:
          </label>
          <Rate
            id="rateID"
            tooltips={descriptor}
            value={star}
            onChange={setStar}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="commentID" className="text-[#006B95] font-montserrat">
            Feedback:
          </label>
          <textarea
            name="comments"
            id="commentID"
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="border-[#C3C3C3] border-[1px] rounded-lg resize-none outline-none drop-shadow-md p-4 font-hind font-medium"
          />
        </div>
      </Modal>
    </div>
  );
}
