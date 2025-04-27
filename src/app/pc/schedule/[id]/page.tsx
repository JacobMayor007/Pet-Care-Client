"use client";

import React, { useEffect, useState } from "react";
import ClientNavbar from "@/app/ClientNavbar/page";
import * as Appointment from "@/app/fetchData/fetchAppointment";
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
import { Modal, Rate } from "antd";
import { db } from "@/app/firebase/config";

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
  Appointment_Rate_Feedback?: {
    feedback: string;
    rate: number;
  };
}

interface DetailsProps {
  params: Promise<{ id: string }>;
}

export default function Schedule({ params }: DetailsProps) {
  const { id } = React.use(params);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [rateModal, setRateModal] = useState(false);
  const descriptor = ["terrible", "bad", "normal", "good", "wonderful"];
  const [star, setStar] = useState(0);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!id) {
      console.error("No Appointment ID provided.");
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const fetchAppointment = async () => {
      try {
        unsubscribe = await Appointment.default(id, (appointmentData) => {
          if (appointmentData) {
            // ✅ Properly convert Firestore Timestamp to Dayjs
            const appointmentDate = appointmentData.Appointment_Date
              ? dayjs((appointmentData.Appointment_Date as Timestamp).toDate())
              : null;

            setAppointment({
              ...appointmentData,
              Appointment_Date: appointmentDate,
            });
          } else {
            console.warn("Appointment not found.");
            setAppointment(null);
          }
        });
      } catch (error) {
        console.error("Error fetching appointment:", error);
      }
    };

    fetchAppointment();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [id]);

  const rateHandle = async () => {
    try {
      const docRef = doc(db, "appointments", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        await updateDoc(docRef, {
          Appointment_Rate_Feedback: {
            feedback: feedback,
            rate: star,
          },
        });

        const notifRef = collection(db, "notifications");
        await addDoc(notifRef, {
          appointment_ID: id,
          sender: appointment?.Appointment_PatientUserUID,
          sender_FullName: appointment?.Appointment_PatientFullName,
          receiver_FullName: appointment?.Appointment_DoctorName,
          receiverID: appointment?.Appointment_DoctorUID,
          title: `Rated Notification`,
          message: `${
            appointment?.Appointment_PatientFullName
          } have rated your service on, ${appointment?.Appointment_Date?.format(
            "MMMM DD, YYYY"
          )} ${appointment?.Appointment_Time}`,
          createdAt: Timestamp.now(),
          hide: false,
          open: false,
          status: "unread",
          isApproved: true,
        });

        const appointmentRef = collection(db, "appointments");
        const q = query(
          appointmentRef,
          where(
            "Appointment_DoctorUID",
            "==",
            appointment?.Appointment_DoctorUID
          )
        );
        const querySnapshot = await getDocs(q);

        const ratingArray: number[] = [];
        querySnapshot.forEach((doc) => {
          const appointmentData = doc.data();
          const rating = appointmentData.Appointment_Rate_Feedback?.rate;

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

        const doctorRef = doc(
          db,
          "doctor",
          appointment?.Appointment_DoctorUID || ""
        );

        const doctorSnap = await getDoc(doctorRef);

        if (!docSnap.exists()) {
          console.error(`Appointment with ID ${id} not found.`);
          return;
        }

        if (doctorSnap.exists()) {
          await updateDoc(doctorRef, {
            doctor_rating: Math.trunc(averageRating),
          });
          console.log(
            `Updated Doctor Total Rating for doctor collection ${appointment?.Appointment_DoctorUID} to ${averageRating}`
          );
        } else {
          console.error(
            `Doctor with ID ${appointment?.Appointment_DoctorUID} not found in 'doctor' collection.`
          );
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  console.log(appointment?.Appointment_DoctorUID);

  return (
    <div>
      <nav className="relative z-20">
        <ClientNavbar />
      </nav>
      <div className="mx-60 mt-9 h-fit ">
        <h1 className="mb-16 font-montserrat font-bold text-[#393939] text-3xl">
          My Appointments
        </h1>

        <div className="grid grid-cols-12 px-4 pb-4 pt-8 bg-white drop-shadow-md rounded-xl">
          <h1 className="col-span-8 font-montserrat font-bold text-3xl text-[#393939]">
            Pet
          </h1>
          <h1 className="col-span-2 font-montserrat font-bold text-3xl text-[#393939] mx-auto">
            Price
          </h1>
          <h1 className="col-span-2 font-montserrat font-bold text-3xl text-[#393939] mx-auto">
            Status
          </h1>
          <div
            className={`${
              appointment?.Appointment_Status === "Paid" &&
              appointment?.Appointment_Rate_Feedback?.rate
                ? `col-span-1`
                : `col-span-2`
            } mt-2`}
          >
            <div className="font-montserrat font-semibold text-base text-[#393939] ">
              {" "}
              Image of {appointment?.Appointment_PatientPetName}
            </div>
          </div>
          <div className="col-span-6">
            <h1 className="text-base text-[#006B95] font-hind font-bold">
              Doctor: {appointment?.Appointment_DoctorName}
            </h1>
            <p className="font-montserrat font-bold text-lg mb-2">
              {appointment?.Appointment_TypeOfAppointment}
            </p>
            <p className="font-hind font-medium text-base text-[#393939]">
              {appointment?.Appointment_PatientTypeOfPayment}
            </p>
          </div>
          <div className="col-span-2 m-auto font-montserrat font-bold text-xl">
            Php {appointment?.Appointment_Price}
          </div>
          <div className="col-span-2 m-auto font-montserrat text-[#006B95] font-bold underline italic">
            {appointment?.Appointment_Status}
          </div>
          <div className="absolute top-0 right-8 ">
            {!appointment?.Appointment_Rate_Feedback?.rate ? (
              <button
                onClick={() => setRateModal(true)}
                className="text-[#006B95] font-montserrat text-sm italic font-medium underline"
              >
                Please Rate{" "}
                <span className="capitalize font-montserrat font-bold text-[#006B95]">
                  {appointment?.Appointment_DoctorName}
                </span>
              </button>
            ) : (
              <Rate value={appointment?.Appointment_Rate_Feedback.rate} />
            )}
          </div>
        </div>
      </div>
      <Modal
        open={rateModal}
        onCancel={() => setRateModal(false)}
        onClose={() => setRateModal(false)}
        onOk={() => {
          setRateModal(false);
          rateHandle();
        }}
      >
        <h1 className="font-montserrat font-bold text-[#006B95]">
          Please rate the service of{" "}
          <span className="capitalize">
            {appointment?.Appointment_DoctorName}
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
