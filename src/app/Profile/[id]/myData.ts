import { db } from "@/app/firebase/config";
import { addDoc, collection, getDocs, orderBy, query, where } from "firebase/firestore";


const myOrders = async(userUID:string)=>{
    try{
        const docRef = collection(db, "Orders");
        const q = query(docRef, where("OC_BuyerID", "==", userUID), orderBy("OC_OrderAt", "desc"))
        const docSnap = await getDocs(q)

        const result = docSnap.docs.map((doc)=>({
            id:doc.id,
            ...doc.data()
        }));

        return result

    }catch(error){
        console.error(error);
        return [];
    }
}

const myBoard = async(userUID:string)=> {
    try{
        const docRef = collection(db, "boarders");
        const q = query(docRef, where("BC_BoarderUID", "==", userUID))
        const docSnap = await getDocs(q)

        const result = docSnap.docs.map((doc)=>({
            boardId:doc.id,
            ...doc.data()
        }));

        return result

    }catch(error){
        console.error(error);
        return [];
    }
}

const myAppointments = async(userUID: string)=> {
    try{
        console.log("BACKEND: ", userUID);
        
        const docRef = collection(db, "appointments");
        const q = query(docRef, where("Appointment_PatientUserUID", "==", userUID), orderBy("Appointment_CreatedAt", "desc"))
        const docSnap = await getDocs(q)

        const result = docSnap.docs.map((doc)=>({
            id:doc.id,
            ...doc.data()
        }));
        
        console.log("BACKEND RESULT: ", result);
        
        return result

    }catch(error){
        console.error(error);
        return [];
    }
}

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



const submitPetHandle = async(petName:string, petYear:number, petMonth:number, petType:string, petSex:string, petBreed:string, petOwnerUID:string, petOwnerEmail:string, petOwnerName:string )=>{

    try{
        const docRef = collection(db, "pets");
        const result = await addDoc (docRef,{
            pet_age:{
                month:petMonth ,
                year: petYear,
            },
            pet_breed: petBreed,
            pet_name: petName,
            pet_ownerEmail:petOwnerEmail, 
            pet_ownerName: petOwnerName,
            pet_ownerUID: petOwnerUID,
            pet_sex: petSex,
            pet_type: petType,
        })
    console.log(result);
    }catch(error){
        console.error(error);
    }
}

export{myAppointments, myBoard, myOrders, getMyPets, submitPetHandle}