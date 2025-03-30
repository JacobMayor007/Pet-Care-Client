import { db } from "@/app/firebase/config";
import { collection, where, query, getDocs } from "firebase/firestore";

const fetchProfile = async (userUID: string) => {
   try{
    const docRef = collection(db, "doctor");
    const userUIDField = where("User_UID", "==", userUID);
    const q = query(docRef, userUIDField);

    const docSnap = await getDocs(q)
    const doctor = docSnap.docs.map((doc)=>({
        id:doc.id,
        ...doc.data()
    }));

    
    console.log(doctor);
    return doctor;
    
   }catch{
    return [];
   }
}

const fetchIsDoctor = async (userUID: string) => {
    try{
     const docRef = collection(db, "doctor");
     const userUIDField = where("User_UID", "==", userUID);
     const q = query(docRef, userUIDField);
 
     const docSnap = await getDocs(q)
     if(docSnap.empty){
         return false;
     }else{
         return true;
     }
    }catch{
     return null;
    }
 }
 

export default fetchProfile;

export {fetchIsDoctor}