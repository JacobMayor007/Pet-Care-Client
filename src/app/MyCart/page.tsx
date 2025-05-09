"use client";

import { Dayjs } from "dayjs";
import ClientNavbar from "../ClientNavbar/page";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from "../firebase/config";
import fetchUserData from "../fetchData/fetchUserData";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
interface CartItem {
  id: string;
  ATC_BuyerFullName?: string;
  ATC_BuyerID?: string;
  ATC_OrderAt?: Dayjs | null;
  ATC_Products?: {
    ATC_ProductID?: string;
    ATC_ProductName?: string;
    ATC_ProductPrice?: string;
  };
  ATC_SellerFullName?: string;
  ATC_SellerID?: string;
}

export default function MyCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<DocumentData[]>([]);
  const [quantity, setQuantity] = useState(0);
  const shippingFee = 100;

  useEffect(() => {
    const getUserData = async () => {
      const fetchedUserData = await fetchUserData();
      setUserData(fetchedUserData);
    };
    getUserData();
  }, []);

  useEffect(() => {
    if (!userData[0]?.User_UID) return;

    const q = query(
      collection(db, "AddToCart"),
      where("ATC_BuyerID", "==", userData[0]?.User_UID)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const items: CartItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          ...data,
          ATC_OrderAt: data.ATC_OrderAt?.toDate(), // Convert Firestore timestamp to Date
        } as CartItem);
      });
      setCartItems(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("Stock", quantity.toString());
      localStorage.setItem("Shipping Fee", shippingFee.toString());
    }
  }, [quantity, shippingFee]);

  if (loading) {
    return (
      <div>
        <nav className="relative z-20">
          <ClientNavbar />
        </nav>
        <div className="flex mx-52 my-10 flex-col gap-8 z-10">
          <h1 className="font-bold font-montserrat text-4xl">My Cart</h1>
          <div className="bg-white drop-shadow-lg h-fit rounded-2xl p-8 text-center">
            Loading your cart items...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <nav className="relative z-20">
        <ClientNavbar />
      </nav>
      <div className="flex mx-52 my-10 flex-col gap-8 z-10">
        <h1 className="font-bold font-montserrat text-4xl">My Cart</h1>
        <div className="grid grid-cols-5 bg-white drop-shadow-lg h-fit rounded-2xl p-8 gap-5">
          <h1 className="col-span-2 font-montserrat text-3xl font-bold text-[#393939]">
            Product
          </h1>
          <h1 className="font-montserrat text-3xl font-bold text-[#393939] justify-self-center">
            Price
          </h1>

          <h1 className="font-montserrat text-3xl font-bold text-[#393939] justify-self-center">
            Quantity
          </h1>

          <div className="w-full h-0.5 rounded-full bg-[#B1B1B1] col-span-5 flex flex-col" />

          {cartItems.length === 0 ? (
            <div className="col-span-5 text-center py-8 font-montserrat text-lg">
              Your cart is empty
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-5 col-span-5 items-center px-4 py-6 border-b-[1px] border-[#C3C3C3]"
              >
                <div className="flex items-center gap-4">
                  <h1 className="font-hind font-bold">
                    {item.ATC_Products?.ATC_ProductName}
                  </h1>
                </div>

                <div className=" flex flex-col gap-0.5">
                  <p className="font-hind text-lg">{item.ATC_SellerFullName}</p>
                </div>

                <div className="justify-self-center font-hind text-[#232323] text-xl font-medium">
                  Php {item.ATC_Products?.ATC_ProductPrice}
                </div>
                <div className="flex flex-row gap-5 items-center">
                  <h1 className="font-hind text-[#393939] text-xl font-bold">
                    Quantity:
                  </h1>
                  <div className="border-[1px] border-[#8C8989] rounded-xl w-[301px] grid grid-rows-[35px] grid-cols-3 items-center">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity(quantity < 1 ? 0 : quantity - 1)
                      }
                      className="border-r-[1px] border-[#8C8989] h-full active:scale-95 transition-all drop-shadow-md active:drop-shadow-xl"
                    >
                      <MinusOutlined />
                    </button>
                    <p className="text-center">{quantity}</p>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="border-l-[1px] border-[#8C8989] h-full active:scale-95 transition-all drop-shadow-md active:drop-shadow-xl"
                    >
                      <PlusOutlined />
                    </button>
                  </div>
                </div>
                <Link
                  href={`/Product/PlaceToOrder/${item?.ATC_Products?.ATC_ProductID}`}
                  className=" bg-[#006B95] text-white font-montserrat rounded-full font-bold hover:bg-[#005a80] w-36 py-3 mx-auto text-base flex items-center justify-center transition-colors"
                >
                  Checkout
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
