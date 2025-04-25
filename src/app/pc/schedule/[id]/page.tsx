"use client";

import React, { useEffect, useState } from "react";
import ClientNavbar from "@/app/ClientNavbar/page";
import * as Appointment from "@/app/fetchData/fetchAppointment";
import dayjs, { Dayjs } from "dayjs";
import { Timestamp } from "firebase/firestore";

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

interface DetailsProps {
  params: Promise<{ id: string }>;
}

export default function Schedule({ params }: DetailsProps) {
  const { id } = React.use(params);
  const [appointment, setAppointment] = useState<Appointment | null>(null);

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

  console.log(appointment);

  return (
    <div>
      <nav className="relative z-20">
        <ClientNavbar />
      </nav>
      <div className="mx-60 mt-9 h-fit ">
        <h1 className="mb-16 font-montserrat font-bold text-[#393939] text-3xl">
          My Appointments
        </h1>

        <div className="grid grid-cols-12 p-4 bg-white drop-shadow-md rounded-xl">
          <h1 className="col-span-8 font-montserrat font-bold text-3xl text-[#393939]">
            Pet
          </h1>
          <h1 className="col-span-2 font-montserrat font-bold text-3xl text-[#393939] mx-auto">
            Price
          </h1>
          <h1 className="col-span-2 font-montserrat font-bold text-3xl text-[#393939] mx-auto">
            Status
          </h1>
          <div className="col-span-2 mt-2">
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
        </div>
      </div>
    </div>
  );
}
