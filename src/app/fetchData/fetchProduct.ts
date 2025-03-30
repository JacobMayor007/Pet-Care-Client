import { getDocs, collection, where, query } from "firebase/firestore";
import { db } from "../firebase/config";

const fetchProduct = async () => {
  try {
    const productRef = collection(db, "products");
    const querySnapshot = await getDocs(productRef);

    // Map through documents and create the products array
    const products = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log(products); // Log the fetched products for debugging
    return products; // Return the products array
  } catch (error) {
    console.error("Error fetching products:", error);
    return []; 
  }
};

const fetchFoodProduct = async () =>{
  try{
    const productsRef = collection(db, "products");
    const foodQuery = query(productsRef, where("Seller_TypeOfProduct", "==", "Food"));

    const foodSnapshot = await getDocs(foodQuery);

    const food = foodSnapshot.docs.map((doc)=>({
      id:doc.id,
      ...doc.data()
    }))

    console.log(food);
    return food;
  }catch(error){
    console.error("Error fetching Food Product", error);
    return [];
  }
}

const fetchItemProduct = async ()=>{
  try{
    const productRef = collection(db, "products");
    const itemQuery = query(productRef, where("Seller_TypeOfProduct", "==", "Item"))

    const itemSnapshot = await getDocs(itemQuery);

    const item = itemSnapshot.docs.map((doc)=>({
      id: doc.id,
      ...doc.data(),
    }))
    console.log("Successfully fetched item products", item);
    return item;

  }catch(error){
    console.error("Error fetching Item data", error)
    return [];
  }
}


export default fetchProduct;

export {fetchFoodProduct, fetchItemProduct}
