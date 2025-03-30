"use client";
import { useEffect, useState } from "react";
import fetchProduct, {
  fetchFoodProduct,
  fetchItemProduct,
} from "../fetchData/fetchProduct";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileShield } from "@fortawesome/free-solid-svg-icons";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import ClientNavbar from "../ClientNavbar/page";
import Link from "next/link";

interface Product {
  id: string;
  Seller_PaymentMethod?: string;
  Seller_TotalPrice?: string;
  Seller_ProductName?: string;
  Seller_ProductDescription?: string;
  Seller_ProductPrice?: string;
  Seller_UserID?: string;
  Seller_ProductFeatures?: string;
  Seller_UserFullName?: string;
}

interface Food {
  id: string;
  Seller_PaymentMethod?: string;
  Seller_TotalPrice?: string;
  Seller_ProductName?: string;
  Seller_ProductDescription?: string;
  Seller_ProductPrice?: string;
  Seller_UserID?: string;
  Seller_ProductFeatures?: string;
  Seller_UserFullName?: string;
}

interface Item {
  id: string;
  Seller_PaymentMethod?: string;
  Seller_TotalPrice?: string;
  Seller_ProductName?: string;
  Seller_ProductDescription?: string;
  Seller_ProductPrice?: string;
  Seller_UserID?: string;
  Seller_ProductFeatures?: string;
  Seller_UserFullName?: string;
}

export default function Shop() {
  // const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [userID, setUserID] = useState("");
  const [, setUserEmail] = useState<string | null>("");
  const router = useRouter();
  const [item, setItem] = useState<Item[]>([]);
  const [food, setFood] = useState<Food[]>([]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserID(user.uid);
        setUserEmail(user.email);
      } else {
        router.push("/Login");
      }
    });

    return () => unsubscribe();
  });

  useEffect(() => {
    const getProducts = async () => {
      const fetchedProducts = await fetchProduct();
      setProducts(fetchedProducts);
    };

    getProducts();
  }, []);

  useEffect(() => {
    const getFood = async () => {
      const fetchedFood = await fetchFoodProduct();
      setFood(fetchedFood);
    };

    getFood();
  }, []);

  useEffect(() => {
    const getItem = async () => {
      const fetchItems = await fetchItemProduct();
      setItem(fetchItems);
    };

    getItem();
  }, []);

  console.log(products);

  return (
    <div className={userID ? `block` : `hidden`}>
      <div className="z-50">
        <ClientNavbar />
      </div>

      <div className="bg-[url('/Shopping.jpg')] bg-cover bg-center px-48 h-72">
        <div className="h-full flex justify-center items-center flex-col">
          <div>
            <h1 className="font-montserrat text-6xl text-white font-bold mb-2">
              Shop it!
            </h1>
            <p className="text-2xl font-montserrat text-white">
              What&#39;s best for your pet
            </p>
            <button className="w-40 h-12 bg-[#006B95] font-hind text-lg rounded-full text-white mt-10">
              Shop now
            </button>
          </div>
        </div>
        <div className="w-full grid grid-cols-5 gap-5 py-5 z-[1]">
          <div className="w-full grid grid-cols-5 gap-5 col-span-5">
            <div className="col-span-5 flex flex-row justify-between items-center">
              <h1 className="col-span-5 font-montserrat text-3xl text-[#393939] font-bold my-4">
                Food
              </h1>
            </div>
            {food.slice(0, 5).map((data) => {
              return (
                <a
                  href={`/Product${data?.id}`}
                  key={data?.id}
                  className="grid grid-rows-11 z-[1] gap-2 bg-white rounded-lg px-3 py-4 hover:border-blue-500 hover:border-[1px] drop-shadow-xl cursor-pointer h-64 transform transition-all active:scale-95 ease-out duration-50 select-none"
                >
                  <div className="flex justify-center row-span-5">
                    <FontAwesomeIcon icon={faFileShield} className="text-8xl" />
                  </div>
                  <div className="font-hind text-xs text-[#565656]">
                    {data?.Seller_UserFullName}
                  </div>
                  <div className="row-span-2 text-ellipsis font-hind text-sm text-[#565656] font-semibold">
                    {data?.Seller_ProductName || "Product Name"}{" "}
                  </div>
                  <div className="font-hind text-sm text-[#565656] font-semibold">
                    Php {data?.Seller_ProductPrice || "Price"}
                  </div>
                  <button className="row-span-2 bg-blue-500 text-white font-hind rounded-md">
                    View Item
                  </button>
                </a>
              );
            })}
          </div>
          <div className="w-full grid grid-cols-5 gap-5 col-span-5">
            <div className="col-span-5 flex flex-row justify-between items-center">
              <h1 className="col-span-5 font-montserrat text-3xl text-[#393939] font-bold my-4">
                Pet Items
              </h1>
            </div>
            {item.slice(0, 5).map((data) => {
              return (
                <Link href="/Product" key={data?.id} passHref legacyBehavior>
                  <a
                    key={data?.id}
                    className="grid grid-rows-11 z-[1] gap-2 bg-white rounded-lg px-3 py-4 hover:border-blue-500 hover:border-[1px] drop-shadow-xl cursor-pointer h-64 transform transition-all active:scale-95 ease-out duration-50 select-none"
                  >
                    <div className="flex justify-center row-span-5">
                      <FontAwesomeIcon
                        icon={faFileShield}
                        className="text-8xl"
                      />
                    </div>
                    <div className="font-hind text-xs text-[#565656]">
                      {data?.Seller_UserFullName}
                    </div>
                    <div className="row-span-2 text-ellipsis font-hind text-sm text-[#565656] font-semibold">
                      {data?.Seller_ProductName || "Product Name"}{" "}
                    </div>
                    <div className="font-hind text-sm text-[#565656] font-semibold">
                      Php {data?.Seller_ProductPrice || "Price"}
                    </div>
                    <button className="row-span-2 bg-blue-500 text-white font-hind rounded-md">
                      View Item
                    </button>
                  </a>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
