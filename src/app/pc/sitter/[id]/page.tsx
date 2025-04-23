"use client";

import ClientNavbar from "@/app/ClientNavbar/page";
import { db } from "@/app/firebase/config";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modal, Rate } from "antd";
import dayjs, { Dayjs } from "dayjs";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect } from "react";
import { useState } from "react";
import "@ant-design/v5-patch-for-react-19";

interface Requester {
  id?: string;
  sitting_service_address?: string;
  sitting_service_createdAt?: Dayjs | null;
  sitting_service_endDate?: Dayjs | null;
  sitting_service_isNewCustomer?: boolean;
  sitting_service_payment_type?: string;
  sitting_service_provider_email?: string;
  sitting_service_provider_id?: string;
  sitting_service_provider_name?: string;
  sitting_service_requester_email?: string;
  sitting_service_requester_id?: string;
  sitting_service_requester_name?: string;
  sitting_service_startDate?: Dayjs | null;
  sitting_service_status?: string;
  sitting_service_price?: number;
  sitting_service_feedback_and_rate: {
    rate: number;
    feedback: string;
  };
  sitting_service_offering_id?: string;
}

interface MyOfferID {
  params: Promise<{ id: string }>;
}

export default function SitterCustomer({ params }: MyOfferID) {
  const { id } = React.use(params);
  const [requester, setRequester] = useState<Requester | null>(null);
  const [rateModal, setRateModal] = useState(false);
  const descriptor = ["terrible", "bad", "normal", "good", "wonderful"];
  const [star, setStar] = useState(0);
  const [successful, setSuccessful] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [acceptModal, setAcceptModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);

  useEffect(() => {
    const OfferID = async () => {
      try {
        const docRef = doc(db, "requester", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          const result = {
            id: docSnap.id,
            ...data,
            sitting_service_createdAt: data?.sitting_service_createdAt
              ? dayjs(data?.sitting_service_createdAt.toDate())
              : null,
            sitting_service_endDate: data?.sitting_service_endDate
              ? dayjs(data?.sitting_service_endDate.toDate())
              : null,
            sitting_service_startDate: data?.sitting_service_startDate
              ? dayjs(data?.sitting_service_startDate.toDate())
              : null,
          } as Requester;

          setRequester(result);
        }
      } catch (error) {
        console.error(error);
      }
    };

    OfferID();
  });

  const handleRate = async () => {
    try {
      const docRef = doc(db, "requester", id || "");
      const docSnap = await getDoc(docRef);
      const notifRef = collection(db, "notifications");

      if (docSnap.exists()) {
        await updateDoc(docRef, {
          sitting_service_feedback_and_rate: {
            rate: star,
            feedback: feedback,
          },
        });

        await addDoc(notifRef, {
          createdAt: Timestamp.now(),
          sitter_id: id,
          receiverID: requester?.sitting_service_provider_id,
          senderID: requester?.sitting_service_requester_id,
          receiver_fullName: requester?.sitting_service_provider_id,
          sender_fullname: requester?.sitting_service_requester_name,
          message: `${
            requester?.sitting_service_requester_name
          } has rated your pet sitting service at ${requester?.sitting_service_startDate?.format(
            "MMMM DD, YYYY"
          )}`,
          open: false,
          status: "unread",
          hide: false,
          title: "sitter",
        });

        setSuccessful(true);

        const ordersRef = collection(db, "requester");
        const q = query(
          ordersRef,
          where(
            "sitting_service_provider_id",
            "==",
            requester?.sitting_service_provider_id
          )
        );
        const querySnapshot = await getDocs(q);

        const ratingArray: number[] = [];
        querySnapshot.forEach((doc) => {
          const sitterData = doc.data();
          const rating = sitterData.sitting_service_feedback_and_rate?.rate;

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
          "sitter",
          requester?.sitting_service_provider_id || ""
        );
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          await updateDoc(productRef, {
            sitter_total_rating: Math.trunc(averageRating),
          });
          console.log(
            `Updated Mortician Total Rating for memorial collection ${requester?.sitting_service_provider_id} to ${averageRating}`
          );
        } else {
          console.error(
            `Mortician with ID ${requester?.sitting_service_provider_id} not found in 'memorial' collection.`
          );
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
    }
  };

  const rejectHandle = async () => {
    try {
      const notifReq = collection(db, "notifications");
      await addDoc(notifReq, {
        createdAt: Timestamp.now(),
        receiverID: requester?.sitting_service_provider_id,
        senderID: requester?.sitting_service_requester_id,
        receiver_fullName: requester?.sitting_service_provider_name,
        sender_fullname: requester?.sitting_service_provider_name,
        message: `${
          requester?.sitting_service_requester_name
        } has rejected your pet sitting offer for the request from ${requester?.sitting_service_startDate?.format(
          "MMMM DD, YYYY - hh:mm A"
        )} to ${requester?.sitting_service_endDate?.format(
          "MMMM DD, YYYY - hh:mm A"
        )}.`,
        open: false,
        status: "unread",
        hide: false,
        title: "sitting",
      });

      setSuccessful(true);

      await deleteDoc(doc(db, "requester", id));
    } catch (error) {
      console.error(error);
    }
  };

  const acceptHandle = async () => {
    try {
      const docRef = doc(db, "requester", id);
      const newCustomerRef = collection(db, "requester");
      const docSnap = await getDoc(docRef);
      const q = query(
        newCustomerRef,
        where(
          "sitting_service_requester_id",
          "==",
          requester?.sitting_service_requester_id || ""
        ),
        where(
          "sitting_service_provider_id",
          "==",
          requester?.sitting_service_provider_id || ""
        )
      );
      const querySnapshot = await getDocs(q);
      const isNewCustomer = querySnapshot.empty;
      const offerRef = doc(
        db,
        "offer",
        requester?.sitting_service_offering_id || ""
      );
      const offerSnap = await getDoc(offerRef);
      const notifRef = collection(db, "notifications");

      if (docSnap.exists()) {
        await updateDoc(docRef, {
          sitting_service_status: "approved",
          sitting_service_isNewCustomer: isNewCustomer,
        });

        await addDoc(notifRef, {
          createdAt: Timestamp.now(),
          sitter_id: requester?.id,
          receiverID: requester?.sitting_service_provider_id,
          senderID: requester?.sitting_service_requester_id,
          receiver_fullName: requester?.sitting_service_provider_name,
          sender_fullname: requester?.sitting_service_provider_name,
          message: `${
            requester?.sitting_service_requester_name
          } has accepted your pet sitting offer for the request from ${requester?.sitting_service_startDate?.format(
            "MMMM DD, YYYY - hh:mm A"
          )} to ${requester?.sitting_service_endDate?.format(
            "MMMM DD, YYYY - hh:mm A"
          )}.`,
          open: false,
          status: "unread",
          hide: false,
          title: "sitting",
        });
      }

      if (offerSnap.exists()) {
        await updateDoc(offerRef, {
          sitting_service_status: "approved",
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

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
            {requester?.sitting_service_provider_name?.charAt(0)}
          </div>
          <div className="flex flex-col justify-center gap-1">
            <h1 className="font-montserrat font-bold capitalize text-lg text-[#393939]">
              Sitter Name: {requester?.sitting_service_provider_name}
            </h1>
            <h1 className="font-montserrat capitalize text-lg text-[#393939]">
              On:{" "}
              {requester?.sitting_service_startDate?.format("MMMM DD, YYYY")}
            </h1>
            <h1 className="font-montserrat font-bold text-[#006B95] underline">
              Status: {requester?.sitting_service_status}
            </h1>
          </div>
          {requester?.sitting_service_feedback_and_rate?.feedback && (
            <p className="m-auto font-hind text-base font-semibold italic underline">
              {requester?.sitting_service_feedback_and_rate.feedback}
            </p>
          )}
          {requester?.sitting_service_feedback_and_rate?.rate && (
            <Rate
              className="m-auto"
              value={requester.sitting_service_feedback_and_rate.rate}
              disabled
            />
          )}

          {requester?.sitting_service_status === "paid" &&
            !requester?.sitting_service_feedback_and_rate?.rate && (
              <button
                onClick={() => setRateModal(true)}
                className="m-auto bg-[#006B95] w-52 h-12 col-span-2 rounded-md text-white font-hind italic font-bold text-xl"
              >
                Click to rate service
              </button>
            )}
          {requester?.sitting_service_status === "offering" && (
            <div className="m-auto flex flex-row gap-28 col-span-2">
              <button
                onClick={() => setAcceptModal(true)}
                className="bg-[#006B95] font-montserrat font-bold text-white px-10 py-3 rounded-full"
              >
                Accept
              </button>
              <button
                onClick={() => setRejectModal(true)}
                className="bg-red-600 font-montserrat font-bold text-white px-10 py-3 rounded-full"
              >
                Reject
              </button>
            </div>
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
            {requester?.sitting_service_provider_name}
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
      <Modal
        open={acceptModal}
        onCancel={() => setAcceptModal(false)}
        onClose={() => setAcceptModal(false)}
        onOk={() => {
          setAcceptModal(false);
          acceptHandle();
        }}
        centered
      >
        Confirming to pet sit by{" "}
        <span className="font-montserrat font-bold text-[#006B95] capitalize">
          {requester?.sitting_service_provider_name}
        </span>
      </Modal>
      <Modal
        open={rejectModal}
        onCancel={() => setRejectModal(false)}
        onClose={() => setRejectModal(false)}
        onOk={() => {
          rejectHandle();
          setRejectModal(false);
        }}
        centered
      >
        <h1>
          Confirming of rejecting the offer of pet sitter{" "}
          <span className="font-montserrat font-bold text-[#006B95] capitalize">
            {requester?.sitting_service_provider_name}
          </span>
        </h1>
      </Modal>
    </div>
  );
}
