import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";

const getMyPets = async(userUID:string) =>{
    try{
        const docRef = collection(db, "pets");
        const q = query(docRef, where("pet_ownerUID", "==", userUID));
        const docSnap = await getDocs(q)

        const result = docSnap.docs.map((doc)=>({
            id:doc.id,
            ...doc.data()
        }));

        return result;

    }catch(error){
        console.error(error);
        return [];
    }
}

export {getMyPets}
