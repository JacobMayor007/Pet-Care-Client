"use client";

import ClientNavbar from "@/app/ClientNavbar/page";
import React, { useEffect, useState } from "react";
import { fetchBookedDetails } from "./room";
import dayjs, { Dayjs } from "dayjs";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import Image from "next/image";
import { Rate, Modal } from "antd";
import { db } from "@/app/firebase/config";

interface RoomID {
  params: Promise<{ id: string }>;
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
  BC_BoarderRateFeedback?: {
    rate: number;
    feedback: string;
  };
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

export default function MyRooms({ params }: RoomID) {
  const { id } = React.use(params);
  const [boardDetails, setBoardDetails] = useState<BoardDetails | null>(null);
  const [showRateModal, setShowRateModal] = useState(false);
  const descriptor = ["terrible", "bad", "normal", "good", "wonderful"];
  const [star, setStar] = useState(0);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const Myrooms = async () => {
      const roomDetails = await fetchBookedDetails(id);

      setBoardDetails({
        ...roomDetails,
        BC_BoarderBoardedAt:
          roomDetails?.BC_BoarderBoardedAt instanceof Timestamp
            ? dayjs((roomDetails?.BC_BoarderBoardedAt).toDate())
            : null,
        BC_BoarderCheckInDate:
          roomDetails?.BC_BoarderCheckInDate instanceof Timestamp
            ? dayjs((roomDetails?.BC_BoarderCheckInDate).toDate())
            : null,
        BC_BoarderCheckOutDate:
          roomDetails?.BC_BoarderCheckOutDate instanceof Timestamp
            ? dayjs((roomDetails?.BC_BoarderCheckOutDate).toDate())
            : null,
        BC_BoarderCheckInTime:
          roomDetails?.BC_BoarderCheckInTime instanceof Timestamp
            ? dayjs((roomDetails?.BC_BoarderCheckInTime).toDate())
            : null,
        BC_BoarderCheckOutTime:
          roomDetails?.BC_BoarderCheckOutTime instanceof Timestamp
            ? dayjs((roomDetails?.BC_BoarderCheckOutTime).toDate())
            : null,
        BC_BoarderUpdated:
          roomDetails?.BC_BoarderUpdated instanceof Timestamp
            ? dayjs((roomDetails?.BC_BoarderUpdated).toDate())
            : null,
      });
    };

    Myrooms();
  }, [id]);

  const feedbackHandle = async () => {
    try {
      const docRef = doc(db, "boarders", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const notifRef = collection(db, "notifications");
        await addDoc(notifRef, {
          createdAt: Timestamp.now(),
          hide: false,
          boardID: id,
          rate: star,
          message: `${boardDetails?.BC_BoarderFullName} rated your room`,
          open: false,
          senderID: boardDetails?.BC_BoarderUID,
          receiverID: boardDetails?.BC_RenterUID,
          status: "unread",
          title: `Rate ${boardDetails?.BC_BoarderFullName} room`,
        });

        await updateDoc(docRef, {
          BC_BoarderRateFeedback: {
            rate: star,
            feedback: feedback,
          },
          BC_BoarderDescriptor: descriptor[star - 1],
        });

        const boardersRef = collection(db, "boarders");
        const q = query(
          boardersRef,
          where("BC_RenterUID", "==", boardDetails?.BC_RenterUID)
        );
        const querySnapshot = await getDocs(q);

        const ratingArray: number[] = [];
        querySnapshot.forEach((doc) => {
          const renterData = doc.data();
          const rating = renterData.BC_BoarderRateFeedback?.rate;

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

        const broadRef = doc(db, "board", boardDetails?.BC_RenterRoomID || "");
        const productSnap = await getDoc(broadRef);

        if (productSnap.exists()) {
          await updateDoc(broadRef, {
            Renter_Room_Total_Rating: Math.trunc(averageRating),
          });
          console.log(
            `Updated Renter Room Total Rating for board collection ${boardDetails?.BC_RenterRoomID} to ${averageRating}`
          );
        } else {
          console.error(
            `Mortician with ID ${boardDetails?.BC_RenterRoomID} not found in 'memorial' collection.`
          );
        }
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  return (
    <div className="h-screen">
      <nav className="relative z-20 ">
        <ClientNavbar />
      </nav>
      <div className="z-10 mx-52 pt-10">
        <h1 className="text-4xl font-bold font-montserrat text-[#393939]">
          Bookings
        </h1>
        <div className=" w-full bg-white drop-shadow-lg rounded-xl mt-10 grid grid-cols-6 p-8 gap-4">
          <h1
            className={`font-montserrat text-xl ${
              boardDetails?.BC_BoarderStatus === "Paid"
                ? `col-span-3`
                : `col-span-4`
            } h-fit`}
          >
            Room
          </h1>
          <h1 className="font-montserrat text-xl h-fit text-center">Price</h1>
          <h1 className="font-montserrat text-xl h-fit text-center">Status</h1>
          {boardDetails?.BC_BoarderStatus === "Paid" ? (
            <h1 className="font-montserrat text-xl h-fit text-center">Rate</h1>
          ) : (
            <h1 className="hidden" />
          )}
          <div className="h-0.5 col-span-6 rounded-full bg-[#C3C3C3]" />
          <div className="h-32 w-32 text-center flex items-center justify-center">
            Image of {boardDetails?.BC_RenterRoomName}
          </div>
          <div
            className={`${
              boardDetails?.BC_BoarderStatus === "Paid"
                ? `col-span-2`
                : `col-span-3`
            } flex flex-col justify-center`}
          >
            <h1 className="font-montserrat font-bold text-[#393939]">
              {boardDetails?.BC_RenterRoomName}
            </h1>
            <p className="mb-2 font-montserrat font-bold text-[#393939]">
              {boardDetails?.BC_BoarderTypeRoom}
            </p>
            <h1 className="font-bold font-hind text-[#096F85]">
              Check-In:{" "}
              <span className="font-hind font-normal">
                {boardDetails?.BC_BoarderCheckInDate?.format("MMMM DD, YYYY")}{" "}
                {boardDetails?.BC_BoarderCheckInTime?.format("hh:mm A")}
              </span>
            </h1>
            <h1 className="font-bold font-hind text-[#096F85]">
              Check-out:{" "}
              <span className="font-hind font-normal">
                {boardDetails?.BC_BoarderCheckOutDate?.format("MMMM DD, YYYY")}{" "}
                {boardDetails?.BC_BoarderCheckOutTime?.format("hh:mm A")}
              </span>
            </h1>
            <p className="font-bold font-hind text-[#006B95] flex flex-row items-center gap-2 mt-2">
              <span>
                <Image
                  src={`/${boardDetails?.BC_TypeOfPayment} Image.svg`}
                  height={30}
                  width={30}
                  alt={`${boardDetails?.BC_TypeOfPayment}`}
                />
              </span>{" "}
              {boardDetails?.BC_TypeOfPayment}
            </p>
          </div>
          <h1 className="my-auto text-center font-bold font-montserrat text-[#393939]">
            Php {boardDetails?.BC_BoarderTotalPrice}
          </h1>
          <h1 className="my-auto text-center font-bold font-montserrat text-[#006B95]">
            {boardDetails?.BC_BoarderStatus}
          </h1>
          {boardDetails?.BC_BoarderRateFeedback?.rate && (
            <Rate
              className="m-auto"
              defaultValue={boardDetails?.BC_BoarderRateFeedback.rate}
            />
          )}
          {boardDetails?.BC_BoarderStatus === "Paid" &&
            !boardDetails.BC_BoarderRateFeedback?.rate && (
              <button
                onClick={() => setShowRateModal(true)}
                className="m-auto py-2 px-3 bg-[#006B95] font-hind text-white font-bold rounded-lg"
              >
                Please Rate {boardDetails?.BC_RenterRoomName}
              </button>
            )}
        </div>
        <Modal
          open={showRateModal}
          onCancel={() => setShowRateModal(false)}
          onClose={() => setShowRateModal(false)}
          onOk={() => {
            setShowRateModal(false);
            feedbackHandle();
          }}
          centered
        >
          <h1 className="font-montserrat font-bold text-[#006B95]">
            Please rate the room of {boardDetails?.BC_RenterFullName},{" "}
            {boardDetails?.BC_RenterRoomName}:
          </h1>
          <div className="my-4">
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
          <div className="flex flex-col my-4">
            <label
              htmlFor="commentID"
              className="text-[#006B95] font-montserrat"
            >
              Feedback:
            </label>
            <textarea
              name="comments"
              id="commentID"
              rows={3}
              value={feedback}
              onChange={(e) => {
                setFeedback(e.target.value);
              }}
              className="border-[#C3C3C3] border-[1px] rounded-lg resize-none outline-none drop-shadow-md p-4 font-hind font-medium"
            />
          </div>
        </Modal>
      </div>
    </div>
  );
}
