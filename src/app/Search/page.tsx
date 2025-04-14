"use client";

import { DatePicker, Modal, Rate, Select } from "antd";
import { useEffect, useState } from "react";
import "@ant-design/v5-patch-for-react-19";
import {
  collection,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import Image from "next/image";
import { db } from "../firebase/config";
import Loading from "../Loading/page";
import ClientNavbar from "../ClientNavbar/page";
import Link from "next/link";

interface Doctor {
  id?: string;
  doctor_available_days?: number[];
  doctor_pet_types_treated?: string[];
  doctor_clinicAddress?: string;
  doctor_clinicName?: string;
  doctor_contact?: string;
  doctor_email?: string;
  doctor_experience?: number;
  doctor_license_number?: string;
  doctor_name?: string;
  doctor_rating?: number;
  doctor_specialty?: string;
  doctor_standard_fee?: number;
  doctor_sub_specialty?: string;
  doctor_time_in?: string;
  doctor_time_out?: string;
  doctor_title?: string;
  doctor_uid?: string;
}

interface Product {
  id: string;
  Seller_PaymentMethod?: string;
  Seller_TotalPrice?: string;
  Seller_ProductName?: string;
  Seller_ProductDescription?: string;
  Seller_ProductPrice?: number;
  Seller_UserID?: string;
  Seller_ProductFeatures?: string;
  Seller_UserFullName?: string;
  Seller_TotalRating?: number;
}

export default function Search() {
  const [providerModal, setProviderModal] = useState(true);
  const [serviceModal, setServiceModal] = useState(false);
  // const [locationModal, setLocationModal] = useState(false);
  const [ratingModal, setRatingModal] = useState(false);
  const [pricingModal, setPricingModal] = useState(false);
  const [chronoModal, setChronoModal] = useState(false);
  const [animalModal, setAnimalModal] = useState(false);
  const [provider, setProvider] = useState("");
  const [service, setService] = useState("");
  const [product, setProduct] = useState<Product[]>([]);
  const [filteredProduct, setFilteredProduct] = useState<Product[]>([]);
  // const [location, setLocation] = useState("");
  const [docSearch, setDocSearch] = useState<Doctor[]>([]);
  const [rating, setRating] = useState(0);
  const [pricing, setPricing] = useState(0);
  const [date, setDate] = useState<Timestamp | null>(null);
  const [loading, setLoading] = useState(false);
  const [animal, setAnimal] = useState("");
  const [searchFilter, setSearchFilter] = useState(false);
  console.log(date);

  console.log(provider);

  const providers = [
    {
      key: 0,
      value: `seller`,
      label: `Product Sellers`,
    },
    {
      key: 1,
      value: `doctor`,
      label: `Pet Vetirinary`,
    },
    {
      key: 2,
      value: `room-provider`,
      label: `Room Boarding House for Pets`,
    },
  ];

  const doctorServices = [
    {
      key: 0,
      label: "Surgery",
      value: "Surgery",
    },
    {
      key: 1,
      label: "Dentistry",
      value: "Dentistry",
    },
    {
      key: 2,
      label: "Dermatology",
      value: "Dermatology",
    },
    {
      key: 3,
      label: "Behavior",
      value: "Behavior",
    },
    {
      key: 4,
      label: "Cardiology",
      value: "Cardiology",
    },

    {
      key: 5,
      label: "Internal Medicine",
      value: "Internal Medicine",
    },

    {
      key: 6,
      label: "Neurology",
      value: "Neurology",
    },
    {
      key: 7,
      label: "Oncology",
      value: "Oncology",
    },
    {
      key: 8,
      label: "Ophthalmology",
      value: "Ophthalmology",
    },
    {
      key: 9,
      label: "Theriogenology",
      value: "Theriogenology",
    },
    {
      key: 10,
      label: "Exotic Companion Mammal Practice",
      value: "Exotic Companion Mammal Practice",
    },
    {
      key: 11,
      label: "Avian Medicine",
      value: "Avian Medicine",
    },
    {
      key: 12,
      label: "Reptile/Amphibian Practice",
      value: "Reptile/Amphibian Practice",
    },
    {
      key: 13,
      label: "Canine/Feline Practice",
      value: "Canine/Feline Practice",
    },
    {
      key: 14,
      label: "Anesthesia",
      value: "Anesthesia",
    },
  ];

  const providerRating = [
    {
      key: 0,
      value: 1,
      label: <Rate disabled value={1} />,
    },
    {
      key: 1,
      value: 2,
      label: <Rate disabled value={2} />,
    },
    {
      key: 2,
      value: 3,
      label: <Rate disabled value={3} />,
    },
    {
      key: 3,
      value: 4,
      label: <Rate disabled value={4} />,
    },
    {
      key: 4,
      value: 5,
      label: <Rate disabled value={5} />,
    },
  ];

  const weeks = [
    {
      key: 0,
      value: 0,
      label: "Sunday",
    },
    {
      key: 1,
      value: 1,
      label: "Monday",
    },
    {
      key: 2,
      value: 2,
      label: "Tuesday",
    },
    {
      key: 3,
      value: 3,
      label: "Wednesday",
    },
    {
      key: 4,
      value: 4,
      label: "Thursday",
    },
    {
      key: 5,
      value: 5,
      label: "Friday",
    },
    {
      key: 6,
      value: 6,
      label: "Saturday",
    },
  ];

  const doctorStandarFee = [
    {
      key: 0,
      value: 500,
      label: "500 below ",
    },
    {
      key: 1,
      value: 1000,
      label: "1000 below ",
    },
    {
      key: 2,
      value: 1500,
      label: "1500 below ",
    },
    {
      key: 3,
      value: 2000,
      label: "2000 below ",
    },
    {
      key: 4,
      value: 2500,
      label: "2500 below ",
    },
    {
      key: 5,
      value: 2501,
      label: "2500 above ",
    },
  ];

  const animalType = [
    {
      key: 0,
      value: "dogs",
      label: "Dog",
    },
    {
      key: 1,
      value: "cats",
      label: "Cat",
    },
    {
      key: 2,
      value: "birds",
      label: "Birds",
    },
    {
      key: 3,
      value: "reptiles",
      label: "Reptiles",
    },
    {
      key: 4,
      value: "exotic animal",
      label: "Exotic Animals",
    },
  ];

  useEffect(() => {
    const getProducts = async () => {
      try {
        const searchRef = collection(db, "products");
        const querySnapshot = await getDocs(searchRef);

        const products = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProduct(products);
      } catch (error) {
        console.error(error);
      }
    };

    getProducts();
  }, []);

  const searchHandle = async () => {
    try {
      setLoading(true);
      setSearchFilter(true);
      const searchRef = collection(db, provider);
      if (provider === "doctor") {
        if (!date) {
          throw new Error("Please select a valid date.");
        }

        const logical = pricing === 2501 ? `>=` : `<`;

        console.log("Logical: ", logical);

        const q = query(
          searchRef,
          where("doctor_specialty", "==", service),
          where("doctor_rating", "==", rating),
          where("doctor_standard_fee", logical, pricing),
          where(
            "doctor_available_days",
            "array-contains",
            date.toDate().getDay()
          )
        );

        const docSnap = await getDocs(q);

        const doctorSearch: Doctor[] = docSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Doctor[];

        const filteredDoctors = doctorSearch.filter((doc) =>
          doc.doctor_pet_types_treated?.includes(animal)
        );

        setDocSearch(filteredDoctors);

        if (filteredDoctors.length === 0) {
          console.warn("No matching doctors found.");
        }
      }

      if (provider === "seller") {
        const filteredProducts = product.filter(
          (doc) =>
            doc.Seller_ProductName?.includes(service) &&
            doc.Seller_TotalRating === rating &&
            doc.Seller_ProductDescription?.includes(service) &&
            doc.Seller_ProductPrice &&
            0 <= pricing
        );

        setFilteredProduct(filteredProducts);
      }
    } catch (error) {
      console.error("Error during search:", error);
      alert(`An error occurred: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  console.log(docSearch);

  return (
    <div>
      {searchFilter ? (
        <div className="">
          {loading && <Loading />}
          {!loading && provider === "doctor" && (
            <div className="h-full mx-52">
              <ClientNavbar />
              <h1 className="mt-16 mb-6 font-montserrat font-bold text-3xl text-[#006B95] capitalize">
                List Of {provider}
              </h1>
              {docSearch.map((data, index) => {
                return (
                  <div
                    key={index}
                    className="relative px-5 py-10 border-[#B1B1B1] gap-5 border-[1px] grid grid-cols-6 bg-white drop-shadow-lg rounded-lg h-56"
                  >
                    <div className="flex items-center justify-center">
                      <h1 className="font-montserrat text-center font-bold text-2xl">
                        {data?.doctor_name} Image
                      </h1>
                    </div>
                    <div className="flex flex-col gap-1 text-center justify-center">
                      <h1 className="font-montserrat font-bold text-[#393939]">
                        Name: {data?.doctor_name}
                      </h1>
                    </div>
                    <div className="flex flex-col gap-1 text-center justify-center">
                      <h1 className="font-hind text-[#393939]">
                        Speciality:{" "}
                        <span className="block font-bold text-[#006B95]">
                          {data?.doctor_specialty}
                        </span>
                      </h1>
                      <h1 className="font-hind text-[#393939]">
                        Sub-Speciality:{" "}
                        <span className="block font-montserrat font-bold text-[#006B95]">
                          {data?.doctor_sub_specialty}
                        </span>
                      </h1>
                      <h1 className="font-montserrat  text-[#232323] text-xl font-bold">
                        Standard Fee: Php {data?.doctor_standard_fee}
                      </h1>
                    </div>
                    <div className="grid grid-cols-2 gap-2 col-span-2">
                      <div className="flex flex-col text-start gap-2 justify-center font-montserrat font-bold">
                        {data?.doctor_available_days?.map((day, dayIndex) => {
                          const weekDay = weeks.find(
                            (week) => week.key === day
                          )?.label;
                          return <span key={dayIndex}>{weekDay}</span>;
                        })}
                      </div>
                      <div className="flex flex-col gap-2">
                        <h1 className="font-hind text-[#292929] font-semibold">
                          Check_In:{" "}
                          <span className="block">{data?.doctor_time_in}</span>
                        </h1>
                        <h1 className="font-hind text-[#292929] font-semibold">
                          Check_Out:{" "}
                          <span className="block">{data?.doctor_time_out}</span>
                        </h1>
                      </div>
                    </div>
                    <div className="flex flex-col text-start pl-10 gap-2 justify-center font-montserrat font-bold">
                      {data?.doctor_pet_types_treated?.map((pet, index) => {
                        return (
                          <p key={index} className="capitalize text-[#006B95]">
                            {pet}
                          </p>
                        );
                      })}
                    </div>
                    <div className="absolute left-5 top-4">
                      <Rate disabled value={data?.doctor_rating} />
                    </div>
                    <Link
                      href={`/Profile/Doctor/${data?.doctor_uid}`}
                      className="absolute top-4 right-5 border-b-2 border-[#006B95] px-2 text-[#006B95] italic"
                    >
                      View Profile Doctor
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
          {!loading && provider === "seller" && (
            <div>
              <div className="relative z-20">
                <ClientNavbar />
              </div>
              <h1 className="font-montserrat font-bold text-2xl text-[#393939] mx-56 my-10">
                List Of Products:{" "}
              </h1>
              {filteredProduct.map((data, index) => {
                return (
                  <div
                    key={index}
                    className="mx-56 grid grid-cols-5 p-4 border-[1px] border-slate-300 h-48 rounded-lg drop-shadow-md bg-white"
                  >
                    <div className=" font-hind text-[#393939] h-16 w-16 rounded-full m-auto border-[1px] border-[#393939] overflow-hidden">
                      Image of {data?.Seller_ProductName}
                    </div>
                    <div className="col-span-2 my-auto flex flex-col gap-1">
                      <h1 className="capitalize font-montserrat font-bold text-[#393939]">
                        {data?.Seller_UserFullName}
                      </h1>
                      <h1 className="font-montserrat font-bold text-[#006B95]">
                        {" "}
                        {data?.Seller_ProductName}
                      </h1>
                      <h1 className="font-montserrat font-bold text-[#393939]">
                        Type of Payment:
                        <span className="block text-[#006B95]">
                          {data?.Seller_PaymentMethod}
                        </span>
                      </h1>
                    </div>
                    <h1 className="m-auto font-montserrat font-bold text-lg text-[#393939]">
                      Php {data?.Seller_ProductPrice}
                    </h1>
                    <Rate
                      value={data?.Seller_TotalRating}
                      disabled
                      className="m-auto"
                    />
                    <Link
                      href={`/Product/${data?.id}`}
                      className="font-hind italic text-[#006B95] absolute right-9 top-4 border-b-2 border-[#006B95] text-center w-28"
                    >
                      View Product
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div>
          <Modal
            open={providerModal}
            centered
            className="flex flex-row"
            onCancel={() => {
              history.back();
            }}
            onOk={() => {
              setServiceModal(provider ? true : false);
              setProviderModal(provider ? false : true);
            }}
          >
            <Select
              placeholder="Select a type of Providers"
              className="my-20 mx-28 h-10 w-72 font-montserrat font-bold text-lg"
              optionFilterProp="label"
              options={providers}
              onChange={(value: string) => {
                setProvider(value);
                setProviderModal(false);
                setServiceModal(true);
              }}
            />
          </Modal>
          <Modal
            onCancel={() => {
              setServiceModal(false);
              setProviderModal(true);
            }}
            open={serviceModal}
            centered
            className="flex flex-row"
            onOk={() => {
              setRatingModal(service ? true : false);
              setServiceModal(service ? false : true);
            }}
          >
            {provider === "doctor" && (
              <div>
                <Select
                  className="my-20 mx-28 h-10 w-72 font-montserrat font-bold text-lg"
                  optionFilterProp="label"
                  placeholder="Select a type of doctor's services"
                  options={doctorServices}
                  onChange={(value: string) => {
                    setService(value);
                    setServiceModal(false);
                    setRatingModal(true);
                  }}
                />
              </div>
            )}
            {provider === "seller" && (
              <div className="">
                <label
                  htmlFor="product-id"
                  className="font-montserrat font-bold text-lg text-[#393939]"
                >
                  Enter your product
                </label>
                <input
                  type="text"
                  name="product"
                  id="product-id"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="block h-10 py-2 px-2 w-3/4 rounded-md border-[1.5px] text-[#393939]  font-semibold border-[#393939] outline-none font-hind "
                />
              </div>
            )}
            {provider === "room-provider" && <div>{provider}</div>}
          </Modal>
          {/* <Modal
        onClose={() => {
          history.back();
        }}
        onCancel={() => {
          history.back();
        }}
        open={locationModal}
        footer={null}
      ></Modal> */}
          <Modal
            onOk={() => {
              setPricingModal(rating ? true : false);
              setRatingModal(rating ? false : true);
            }}
            open={ratingModal}
            centered
            onCancel={() => {
              setRatingModal(false);
              setServiceModal(true);
            }}
          >
            <h1 className="font-montserrat font-bold text-2xl text-[#393939]">
              Ratings
            </h1>
            <div className="flex justify-center mt-10 mb-16">
              <Select
                placeholder="Please select number of rating"
                className="h-11"
                onChange={(value) => {
                  setRating(value);
                  setPricingModal(true);
                  setRatingModal(false);
                }}
                options={providerRating}
              />
            </div>
          </Modal>
          <Modal
            open={pricingModal}
            centered
            onCancel={() => {
              setRatingModal(true);
              setPricingModal(false);
            }}
            onOk={() => {
              setChronoModal(provider !== "seller" ? true : false);
              setPricingModal(false);
              setAnimalModal(true);
            }}
            onClose={() => history.back()}
          >
            <div className="my-5 grid grid-rows-3 items-center">
              <h1 className="font-montserrat  font-bold text-[#393939] text-2xl mb-4">
                Pricing
              </h1>

              <Select
                allowClear
                options={doctorStandarFee}
                onChange={(value: number) => {
                  setPricing(value);
                  setChronoModal(provider !== "seller" ? true : false);
                  setPricingModal(false);
                }}
              />
            </div>
          </Modal>
          <Modal
            open={chronoModal}
            centered
            onCancel={() => {
              setPricingModal(true);
              setChronoModal(false);
            }}
            onOk={() => {
              setAnimalModal(date !== null ? true : false);
              setChronoModal(date !== null ? false : true);
            }}
          >
            <div className="grid grid-cols-2">
              <h1 className="font-montserrat col-span-2 font-bold text-lg">
                Date
              </h1>
              <DatePicker onChange={(date: Timestamp) => setDate(date)} />
            </div>
          </Modal>
          <Modal
            open={animalModal}
            centered
            onCancel={() => {
              setChronoModal(provider === "seller" ? false : true);
              setAnimalModal(false);
              setPricingModal(provider === "seller" ? true : false);
            }}
            onOk={() => setAnimalModal(animal ? false : true)}
          >
            <div className="my-5 grid grid-rows-3 items-center">
              <h1 className="font-montserrat col-span-2 font-bold text-lg">
                Animal Type
              </h1>

              <Select
                allowClear
                onChange={(value: string) => setAnimal(value)}
                options={animalType}
              />
            </div>
          </Modal>
          <div className="h-screen grid grid-cols-3 pt-10 pb-8">
            <div className="flex flex-col mx-8 gap-24 bg-white drop-shadow-md rounded-lg ">
              <div className="w-full h-56 bg-dashboard  rounded-lg">
                <Image
                  alt={`asdasdasd`}
                  src={`/doctor.svg`}
                  width={110}
                  height={50}
                  className="object-contain w-full h-full"
                />
              </div>

              <h1 className="capitalize text-xl font-montserrat mx-8 text-center font-medium text-nowrap bg-[#006B95] px-12 py-6 text-white drop-shadow-md rounded-md">
                Provider Type:
                <span className="block text-2xl text-white font-bold">
                  {provider}
                </span>
              </h1>
              {provider === "doctor" && (
                <h1 className="text-xl capitalize font-montserrat mx-8 text-center font-medium bg-[#006B95] px-12 py-6 text-white drop-shadow-md rounded-md">
                  Service Type:
                  <span className="block text-2xl text-white font-bold">
                    {service}
                  </span>
                </h1>
              )}
              {provider === "seller" && (
                <h1 className="text-xl capitalize font-montserrat mx-8 text-center font-medium bg-[#006B95] px-12 py-6 text-white drop-shadow-md rounded-md">
                  Product:
                  <span className="block text-2xl text-white font-bold">
                    {service}
                  </span>
                </h1>
              )}
              {!provider ? (
                <h1 className="text-xl capitalize font-montserrat mx-8 text-center font-medium bg-[#006B95] px-12 py-6 text-white drop-shadow-md rounded-md">
                  Service Type:
                  <span className="block text-2xl text-white font-bold">
                    {service}
                  </span>
                </h1>
              ) : (
                <div></div>
              )}
            </div>
            <div className="flex flex-col mx-8 gap-10 text-white bg-white drop-shadow-md rounded-lg">
              <div className="w-full h-56 bg-dashboard  rounded-lg">
                <Image
                  alt={`asdasdasd`}
                  src={`/doctor.svg`}
                  width={110}
                  height={50}
                  className="object-contain w-full h-full"
                />
              </div>
              <h1 className="text-xl capitalize font-montserrat text-center font-medium  mx-8  bg-[#006B95] px-12 py-6 text-white drop-shadow-md rounded-md">
                Rating:
                <span className="block text-2xl text-white font-bold">
                  <Rate disabled value={rating} />
                </span>
              </h1>
              <h1 className="text-xl capitalize font-montserrat text-center font-medium  mx-8  bg-[#006B95] px-12 py-6 text-white drop-shadow-md rounded-md">
                Pricing:
                <span className="block text-2xl text-white font-bold">
                  {pricing !== 2501 ? `${pricing} below` : `${pricing} above`}{" "}
                </span>
              </h1>
              {provider === "seller" ? (
                <div></div>
              ) : (
                <h1 className="text-xl capitalize font-montserrat text-center font-medium  mx-8  bg-[#006B95] px-12 py-6 text-white drop-shadow-md rounded-md">
                  Date:
                  <span className="block text-2xl text-white font-bold">
                    {date?.toDate().toDateString()}
                  </span>
                </h1>
              )}
            </div>
            {provider !== "seller" && (
              <div className="flex flex-col mx-8 gap-24 bg-white drop-shadow-md rounded-lg">
                <div className="w-full h-56 bg-dashboard  rounded-lg">
                  <Image
                    alt={`asdasdasd`}
                    src={`/doctor.svg`}
                    width={110}
                    height={50}
                    className="object-contain w-full h-full"
                  />
                </div>

                <h1 className="text-xl capitalize font-montserrat text-center font-medium  mx-8  bg-[#006B95] px-12 py-6 text-white drop-shadow-md rounded-md">
                  Animal:
                  <span className="block text-2xl text-white font-bold">
                    {animal}
                  </span>
                </h1>
              </div>
            )}
          </div>
          <div
            className="place-self-end px-10 pt-2 pb-10"
            onClick={searchHandle}
          >
            <button
              type="button"
              className="bg-[#006B96] font-bold text-xl text-white font-montserrat py-2 px-4 rounded-md active:scale-95"
            >
              Search
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
