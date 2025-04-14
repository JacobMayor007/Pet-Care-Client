"use client";
import Image from "next/image";
import {
  faCircleCheck,
  faCircleXmark,
  faCircleChevronDown,
  faCircleUser,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
  DocumentData,
  Timestamp,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase/config";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Signout from "../SignOut/page";

type Feature = {
  id: string;
  name: string;
  price: number;
};

const Review = () => {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>("");
  const [confirm, setConfirm] = useState(false);
  const [logout, setLogout] = useState(false);
  const [userData, setUserData] = useState<DocumentData[]>([]);
  let priceIndicator = 0;
  const [productName, setProductName] = useState<string | null>(null);
  const [productFeature, setProductFeature] = useState<string | null>(null);
  const [productDescription, setProductDescription] = useState<string | null>(
    null
  );
  const [typeOfProduct, setTypeOfProduct] = useState<string | null>(null);
  const [stock, setStock] = useState<number>(0);
  const [productPrice, setProductPrice] = useState<number>(0);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [typeOfPayment, setTypeOfPayment] = useState<string | null>(null);

  useEffect(() => {
    // Ensure code runs only on the client-side (in the browser)
    if (typeof window !== "undefined") {
      const storedProductName = localStorage.getItem("Product Name:");
      const storedProductFeature = localStorage.getItem("Product Features:");
      const storedProductDescription = localStorage.getItem(
        "Product Description:"
      );
      const storedProductPrice = Number(localStorage.getItem("Product Price:"));
      const storedTypeOfPayment = localStorage.getItem("Type Of Payment:");
      const parsedTypeOfPayment = storedTypeOfPayment
        ? JSON.parse(storedTypeOfPayment) // Parse if it's a stringified array
        : storedTypeOfPayment;
      const storedStock = Number(localStorage.getItem("Stock:"));
      const storedTypeOfProduct = localStorage.getItem("Type of Product:");

      setTypeOfProduct(storedTypeOfProduct);
      setProductName(storedProductName);
      setProductFeature(storedProductFeature);
      setProductDescription(storedProductDescription);
      setProductPrice(storedProductPrice);
      setTypeOfPayment(parsedTypeOfPayment);
      setStock(storedStock);

      // Retrieve the image from localStorage
      const storedImage = localStorage.getItem("uploadedImage");
      if (storedImage) {
        setImageBase64(storedImage); // Set the Base64 string to state
      } else {
        console.warn("No image found in localStorage");
      }
    }
  }, []);

  let totalPrice = 0;

  // Initialize `feature` as an empty array to handle cases where `productFeature` is null
  const features: Feature[] = productFeature ? JSON.parse(productFeature) : [];
  features.map((data) => {
    priceIndicator += Number(data?.price);
  });
  totalPrice = productPrice + Number(priceIndicator);

  const toAddProduct = () => {
    router.push("/AddProduct");
  };

  const confirmation = () => {
    router.push("/Review");
    setConfirm(true);
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setUserEmail(user.email);
      } else {
        console.warn("No user is logged in.");
      }
    });

    // Clean up the listener
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    console.log("userEmail:", userEmail);
    console.log("userId:", userId);

    const fetchUserData = async () => {
      try {
        if (userEmail && userId) {
          // Query the Users collection with both conditions
          const userQuery = query(
            collection(db, "Users"),
            where("User_Email", "==", userEmail),
            where("User_UID", "==", userId)
          );

          // Execute the query
          const querySnapshot = await getDocs(userQuery);

          if (!querySnapshot.empty) {
            // Extract all fields for the matching document(s)
            const userData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            setUserData(userData);
          } else {
            console.log("No matching user found.");
          }
        } else {
          console.log("userEmail or userId is missing");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userEmail, userId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fullName = userData
      .map((user) => `${user.User_FName} ${user.User_LName}`)
      .join(", ");

    console.log(fullName);

    try {
      const q = query(
        collection(db, "products"),
        where("Seller_ProductName:", "==", productName),
        where("UserID", "==", userId)
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        const productData = {
          Seller_ProductName: productName,
          Seller_ProductDescription: productDescription,
          Seller_ProductFeatures: productFeature,
          Seller_ProductPrice: productPrice.toString(),
          Seller_PaymentMethod: Array.isArray(typeOfPayment)
            ? typeOfPayment.join(", ")
            : typeOfPayment,
          Seller_TotalPrice: totalPrice,
          Seller_UserID: userId,
          Seller_StockQuantity: stock,
          Seller_UserFullName: fullName,
          Seller_TypeOfProduct: typeOfProduct,
          Seller_CreatedAt: Timestamp.now(),
        };

        const docRef = await addDoc(collection(db, "products"), productData);
        console.log("Document written with ID:", docRef.id);
        setConfirm(false);
        router.push("/Provider");
        window.localStorage.clear();
      } else {
        console.log("Duplicate product found. Document not added.");
        alert("This product already exists in your list.");
        setConfirm(false);
      }
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div className="h-full bg-[#D9F0FF] pb-5">
      <nav className="h-20 flex flex-row justify-center items-center">
        <div className="flex items-center gap-16">
          <div className="flex items-center">
            <Image src="./Logo.svg" height={54} width={54} alt="Logo" />
            <h1 className="text-2xl font-sigmar font-normal text-[#006B95]">
              Pet Care
            </h1>
          </div>
          <ul className="list-type-none flex items-center gap-3">
            <li className="w-28 h-14 flex items-center justify-center">
              <Link
                href="/Provider"
                className="font-montserrat text-base text-[#006B95]"
              >
                Dashboard
              </Link>
            </li>
            <li className="w-28 h-14 flex items-center justify-center">
              <Link
                href="/Inbox"
                className="font-montserrat text-base text-[#006B95]"
              >
                Inbox
              </Link>
            </li>
            <li className="w-28 h-14 flex items-center justify-center">
              <Link
                className="font-montserrat text-base text-[#006B95]"
                href="/Notifications"
              >
                Notifications
              </Link>
            </li>
            <li className="w-36 h-14 flex items-center justify-center">
              <Link
                className="font-montserrat text-base text-[#006B95]"
                href="/AddProduct"
              >
                Add New Product
              </Link>
            </li>
          </ul>
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer">
              <FontAwesomeIcon
                icon={faCircleUser}
                className="text-blue-950 text-3xl"
              />
              <FontAwesomeIcon
                icon={faCircleChevronDown}
                className="absolute left-5 top-5 text-blue-950"
                onClick={() => setLogout((prev) => !prev)}
              />
              <div
                className={logout ? `flex absolute top-9 -left-6` : `hidden`}
                onClick={() => setLogout((prev) => !prev)}
              >
                <Signout />
              </div>
            </div>

            <h1 className="font-montserrat text-base text-[#006B95]">
              {/* {userEmail ? userEmail : `No Email Address`} */}
              {userEmail}
            </h1>
          </div>
        </div>
      </nav>

      <div className="h-full bg-white py-7 mr-4 pr-8 flex flex-row gap-5 ml-32 my-10 rounded-lg">
        <div className="h-full w-1/3 flex flex-col pt-16 px-8 gap-10 ">
          <div className="flex justify-start items-start">
            {!productName ||
            !productDescription ||
            productPrice.toString() === "0" ? (
              <div className="flex flex-row gap-2">
                <FontAwesomeIcon
                  icon={faCircleXmark}
                  className="text-xl text-red-500 object-contain"
                />
                <h1 className="font-hind text-xl text-[#06005B]">
                  Product Information
                </h1>
              </div>
            ) : (
              <div className="flex flex-row gap-4 items-center">
                <FontAwesomeIcon
                  icon={faCircleCheck}
                  className="text-xl text-green-500 object-contain"
                />
                <h1 className="font-hind text-xl text-[#06005B]">
                  Product Information
                </h1>
              </div>
            )}
          </div>
          <div className="flex justify-start">
            <h1 className="font-hind text-xl text-[#06005B]  bg-left-bottom bg-gradient-to-r from-[#06005B] to-[#06005B] bg-no-repeat bg-[length:100%_4px] pb-2">
              Review
            </h1>
          </div>
        </div>
        <div className="h-full w-2/3 py-10 flex flex-col items-center gap-3 px-16 ">
          <div className="h-full w-full bg-[#86B2B4] flex flex-col p-10 rounded-lg gap-10">
            <div className="h-full py-4 flex justify-center items-center bg-white rounded-xl">
              {imageBase64 ? (
                <div>
                  <Image
                    src={imageBase64}
                    alt="Uploaded Product"
                    width={250}
                    height={250}
                    className="object-contain h-full rounded-lg"
                  />
                  <p className="text-center font-hind text-[#06005B] font-medium">
                    {productName}
                  </p>
                </div>
              ) : (
                <p></p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 items-center bg-white p-8 rounded-xl">
              <h1 className="text-lg text-[#06005B] font-hind font-semibold">
                Product Details
              </h1>
              <div className="flex justify-end cursor-pointer">
                <FontAwesomeIcon
                  onClick={toAddProduct}
                  icon={faEdit}
                  className="object-contain text-blue-950"
                />
              </div>
              <h1 className="text-base font-hind tracking-wide text-[#565656] font-normal">
                Product Name
              </h1>
              <p className="text-end font-hind text-[#06005B] font-medium">
                {productName}
              </p>
              <h1 className="text-base font-hind text-[#565656] font-normal">
                Product Description
              </h1>

              <p className="text-[#06005B] text-base font-hind tracking-wide leading-8 font-medium text-justify">
                {productDescription}
              </p>
              <h1 className="text-base font-hind text-[#565656] font-normal">
                Product Stock
              </h1>

              <p className="text-[#06005B] text-base font-hind tracking-wide leading-8 font-medium text-end">
                {stock}
              </p>
              <h1 className="text-base font-hind text-[#565656] font-normal">
                Type Of Product
              </h1>
              <p className="text-[#06005B] text-base font-hind tracking-wide leading-8 font-medium text-end">
                {typeOfProduct}
              </p>
              <h1 className="text-base font-hind text-[#565656] font-normal col-span-2">
                Product Features:
              </h1>
              <div>
                {features.map((data) => {
                  return (
                    <div
                      key={data?.id}
                      className=" text-[#565656] text-base font-hind font-medium tracking-wide "
                    >
                      {data?.name}
                    </div>
                  );
                })}
              </div>
              <div className="">
                {features.map((data) => {
                  return (
                    <div
                      key={data?.id}
                      className="text-[#06005B] font-hind text-base font-medium text-end"
                    >
                      {data?.price.toString()}
                    </div>
                  );
                })}
              </div>
              <h1 className="text-base font-medium font-hind text-[#565656]">
                Product Price
              </h1>
              <p className="text-base font-hind text-[#06005B] font-medium text-end">
                {productPrice}
              </p>
              <h1 className="text-base font-medium font-hind text-[#565656]">
                Type Of Payment
              </h1>
              <p className="text-base font-medium font-hind text-[#06005b] text-end">
                {Array.isArray(typeOfPayment) // Check if it's an array
                  ? typeOfPayment.join(", ") // Join array values with a comma and space
                  : typeOfPayment}{" "}
                {/* Display as-is if it's not an array */}{" "}
              </p>
              <h1 className="text-base font-medium font-hind text-[#565656]">
                Total Price
              </h1>
              <p className="text-[#06005b] font-medium text-base font-hind text-end">
                <span className="font-hind text-base text-[#9e9e9e] mx-1">
                  Php
                </span>{" "}
                {totalPrice}
              </p>
            </div>
          </div>
          <div className="w-full flex justify-between">
            <a
              className="py-2 w-24 font-hind text-base border-[1px] border-black shadow-sm shadow-slate-500 flex items-center justify-center rounded-lg"
              href="/AddProduct"
            >
              Cancel
            </a>
            <button
              onClick={confirmation}
              className="cursor-pointer border-[1px] border-black p-3 rounded-lg text-base font-hind tracking-wide shadow-md shadow-gray-700 text-white bg-[#06005b] flex items-center justify-center"
            >
              Submit
            </button>
          </div>
        </div>
      </div>

      {confirm ? (
        <div className="h-[200vh] w-screen absolute top-0 z-[1]">
          {/* Background blur */}
          <div className="h-full w-full absolute top-0 z-[1] blur-sm backdrop-blur-sm" />

          {/* Content */}
          <div className="z-[2] relative flex-col mx-[40%] my-[20%]">
            <FontAwesomeIcon
              icon={faXmark}
              className="ml-52 cursor-pointer"
              onClick={() => setConfirm(false)}
            />
            <div className="py-16 px-4 bg-blue-400 rounded-lg flex flex-row justify-between w-96">
              <button
                className="cursor-pointer border-[1px] p-3 text-base font-hind tracking-wide shadow-md shadow-gray-500 rounded-lg text-[#565656] bg-white font-medium"
                onClick={() => setConfirm(false)}
              >
                Cancel
              </button>
              <button className="cursor-pointer border-[1px] p-3 shadow-md shadow-gray-500 rounded-lg text-[#565656] bg-[#06005B] border-black">
                <a
                  className="text-base font-hind tracking-wide font-medium text-white"
                  onClick={onSubmit}
                >
                  Proceed to Post
                </a>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden"></div>
      )}
    </div>
  );
};

export default Review;
