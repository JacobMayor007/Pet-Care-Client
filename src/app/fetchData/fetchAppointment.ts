import { doc, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/app/firebase/config";

interface Appointment {
  id?: string;
  Appointment_CreatedAt?: string;
  Appointment_Date?: Timestamp | string | null; // ✅ Allow both Timestamp and string
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
}

const fetchIDAppointment = async (
  appointment_id: string,
  callback: (appointment: Appointment | null) => void
) => {
  if (!appointment_id) {
    console.error("Invalid appointment ID.");
    return;
  }

  const docRef = doc(db, "appointments", appointment_id);

  const unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const appointmentData = docSnap.data() as Appointment;
        callback(appointmentData);
      } else {
        callback(null); // ✅ Now explicitly allowing null
      }
    },
    (error) => {
      console.error("Error fetching appointment:", error);
    }
  );

  return unsubscribe;
};

export default fetchIDAppointment;






