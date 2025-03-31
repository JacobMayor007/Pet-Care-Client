import fetchUserData from "@/app/fetchData/fetchUserData";
import { db } from "@/app/firebase/config";
import { addDoc, collection, doc, getDoc, Timestamp, updateDoc } from "firebase/firestore";

interface Order {
    id?: string;
    OC_BuyerFullName?: string;
    OC_BuyerID?: string;
    OC_ContactNumber?: string;
    OC_DeliverAddress?: string;
    OC_DeliverTo?: string;
    OC_OrderAt?: string;
    OC_PaymentMethod?: string;
    OC_Products?: {
      OC_ProductID?: string;
      OC_ProductName?: string;
      OC_ProductPrice?: string;
      OC_ProductQuantity?: number;
      OC_ShippingFee?: number;
    };
    OC_SellerFullName?: string;
    OC_SellerID?: string;
    OC_TotalPrice?: number;
  }

  const statusOrder = async (order_ID:string) => {
    
   try{
        const docRef = doc(db, "Orders", order_ID);
        const docSnap = await getDoc(docRef);

        if(docSnap.exists()){
            return {id:docSnap.id, ...docSnap.data() as Order}
        }
   }catch(err){
    console.error(err);
    return null;
   }
  }



  const feedbackOrder = async (feedback: string, rate: number, order_ID: string, senderID:string, receiverID:string, item:string) =>{
    const userData = await fetchUserData();
    const displayName = userData[0]?.User_Name;

    try{
        const docRef = doc(db, "Orders", order_ID);
        const docSnap = await getDoc(docRef);
        
        if(docSnap.exists()){
            const fbNotifRef = collection(db, "notifications");
            const addedFbNotif = await addDoc(fbNotifRef, {
                createdAt: Timestamp.now(),
                hide: false,
                item: item,
                message: `${displayName} has rate your product`,
                open:false,
                order_ID: order_ID,
                receiverID: receiverID,
                senderID: senderID,
                status: "unread",
                title: `Rate ${displayName} product`
            });
            console.log("Feedback Notifications Added: ", addedFbNotif);

            const updated = updateDoc(docRef,{
                OC_RatingAndFeedback:{
                    feedback: feedback,
                    rating: rate,
                }
            });

            return updated;
        }

    }catch(error){
        console.error(error);
        return error;
    }
  }

  export {statusOrder, feedbackOrder}