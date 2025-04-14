import fetchUserData from "@/app/fetchData/fetchUserData";
import { db } from "@/app/firebase/config";
import { addDoc, collection, doc, getDoc, getDocs, query, Timestamp, updateDoc, where } from "firebase/firestore";

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



  const feedbackOrder = async (
    feedback: string,
    rate: number,
    order_ID: string,
    senderID: string,
    receiverID: string,
    item: string,
    item_ID: string
  ) => {
    const userData = await fetchUserData();
    const displayName = userData[0]?.User_Name;
  
    try {
      // Reference to the specific order document
      const docRef = doc(db, "Orders", order_ID);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        // Add a notification for the feedback
        const fbNotifRef = collection(db, "notifications");
        const addedFbNotif = await addDoc(fbNotifRef, {
          createdAt: Timestamp.now(),
          hide: false,
          item: item,
          message: `${displayName} has rated your product`,
          open: false,
          item_ID: item_ID,
          order_ID: order_ID,
          receiverID: receiverID,
          senderID: senderID,
          status: "unread",
          title: `Rate ${displayName}'s product`,
        });
        console.log("Feedback Notification Added: ", addedFbNotif);
  
        // Update feedback and rating on the specific order
        await updateDoc(docRef, {
          OC_RatingAndFeedback: {
            feedback: feedback,
            rating: rate,
            createdAt: Timestamp.now(),
          },
        });
  
        // Query all orders that include the same product ID
        const ordersRef = collection(db, "Orders");
        const q = query(ordersRef, where("OC_Products.OC_ProductID", "==", item_ID));
        const querySnapshot = await getDocs(q);
  
        const ratingArray: number[] = [];
        querySnapshot.forEach((doc) => {
          const orderData = doc.data();
          const rating = orderData.OC_RatingAndFeedback?.rating;
  
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
  
        // Update product's average rating
        const productRef = doc(db, "products", item_ID);
        const productSnap = await getDoc(productRef);
  
        if (productSnap.exists()) {
          await updateDoc(productRef, {
            Seller_TotalRating: Math.trunc(averageRating),
          });
          console.log(`Updated Seller_TotalRating for Product ID ${item_ID} to ${averageRating}`);
        } else {
          console.error(`Product with ID ${item_ID} not found in 'products' collection.`);
        }
      }
    } catch (error) {
      console.error("Error updating rating:", error);
      return error;
    }
  };
  

  export {statusOrder, feedbackOrder}