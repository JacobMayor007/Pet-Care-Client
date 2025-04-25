import { db } from "@/app/firebase/config"

import { addDoc, collection, doc, getDocs, query, Timestamp, updateDoc, where } from "firebase/firestore"

const handleLikedPets = async (petID: string, petOwnerUID: string, likedpetId: string, UserEmail: string) => {
    try {
      console.log("Checking for a match between:", petID, "and", likedpetId);
  
      const docRef = collection(db, "matches");
  
      const q = query(
        docRef,
        where("likedpetId", "in", [petID, likedpetId]),
        where("petId", "in", [petID, likedpetId])
      );
  
      const matchSnapshot = await getDocs(q);
  
      if (!matchSnapshot.empty) {
        const matchDoc = matchSnapshot.docs[0];
        const matchDocId = matchDoc.id; 
        const matchData = matchDoc.data()
  
        console.log("Match found! Document ID:", matchDocId);
        console.log("Existing match data:", matchData);
  
        const matchedUserEmail = matchData.userEmail;
        const matchedUserUID = matchData.userUID;
        const matchedPetID = matchData.petId;
  
        console.log(matchedUserEmail, matchedPetID);
        
  
        const matchedPetWith = matchData.matchedPetWith || [];

        await addDoc(collection(db, "matching-notifications"), {
            receiverEmail: [...new Set([matchedUserEmail, UserEmail])],
            receiverUid: [...new Set([matchedUserUID, petOwnerUID])],
            senderEmail: UserEmail, 
            message: `You have a matched pet! Send them a message.`,
            status: `matched`,
            open: false,
            hide: false,
            timestamp: Timestamp.now(), 
            });
    
            console.log("Notification sent!");
  
        console.log("Updating match with:", {
          matchedWith: [...matchedUserEmail, UserEmail],
          matchedPetWith: [...matchedPetWith, petID],
        });
  
        // Update the match document
        await updateDoc(doc(db, "matches", matchDocId), {
          status: "matched",
          matchedWith: [matchedUserEmail, UserEmail], // Ensure unique entries
          matchedPetWith: [matchedPetID, petID], // Ensure unique entries
        });
        console.log("Match successfully updated!");
        return true
      } else {
       const result = await addDoc(collection(db, "matches"), {
          petId: petID,
          userUID: petOwnerUID,
          likedpetId: likedpetId,
          userEmail: UserEmail,
        })
        console.log("Add Hearted Pet: ", result);
        
      }
    } catch (error) {
      console.error("Error updating match:", error);
    }
  };

export {handleLikedPets}