import { db } from "../firebase/config";
import { collection, getDocs } from "firebase/firestore";


const fetchDoctor = async ()=>{
    try{
        const doctorRef = collection(db, "doctor");
        const querySnapshot = await getDocs(doctorRef);

        const doctor = querySnapshot.docs.map((doc)=>({
            id: doc.id,
            ...doc.data()
        }))

        console.log(doctor);
        return doctor
    }catch(error){
        console.error("Error fetching doctors data", error);
        return [];
    }
}

export default fetchDoctor;