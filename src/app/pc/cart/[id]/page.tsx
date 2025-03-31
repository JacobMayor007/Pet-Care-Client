"use client";

import ClientNavbar from "@/app/ClientNavbar/page";
import React, { useState, useEffect } from "react";
import { feedbackOrder, statusOrder } from "./statusOrder";
import Image from "next/image";
import { Modal, Rate } from "antd";
import "@ant-design/v5-patch-for-react-19";

interface DetailsProps {
  params: Promise<{ id: string }>;
}

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
  OC_Status?: string;
  OC_TotalPrice?: number;
  OC_RatingAndFeedback?: {
    feedback?: string;
    rating?: number;
  };
}

export default function Details({ params }: DetailsProps) {
  const { id } = React.use(params);
  const [listOfOrders, setListOfOrders] = useState<Order | null>(null);
  const [modalRate, setModalRate] = useState(false);
  const [feedback, setFeedback] = useState("");
  const descriptor = ["terrible", "bad", "normal", "good", "wonderful"];
  const [star, setStar] = useState(0);

  useEffect(() => {
    const getStatusOrder = async () => {
      const status = await statusOrder(id);
      setListOfOrders(status || null);
    };
    getStatusOrder();
  }, [id]);

  const handleRate = async (
    order_ID: string,
    sellerID: string,
    buyerUID: string,
    item: string
  ) => {
    try {
      if (!order_ID) {
        throw "Order ID is undefined";
      }
      feedbackOrder(feedback, star, order_ID, sellerID, buyerUID, item);
    } catch (error) {
      console.error(error);
    }
  };

  console.log(star, feedback);

  return (
    <div>
      <nav className="relative z-20">
        <ClientNavbar />
      </nav>
      <div className="flex mx-52 my-10 flex-col gap-8 z-10">
        <h1 className="font-bold font-montserrat text-4xl ">Transactions</h1>
        <div className="grid grid-cols-5 bg-white drop-shadow-lg h-fit rounded-2xl p-8 gap-5">
          <h1
            className={`${
              listOfOrders?.OC_Status === "shipped"
                ? `col-span-2`
                : `col-span-3 `
            } font-montserrat text-3xl font-bold text-[#393939]`}
          >
            Pet
          </h1>
          <h1 className="font-montserrat text-3xl font-bold text-[#393939] justify-self-center">
            Price
          </h1>
          <h1 className="font-montserrat text-3xl font-bold text-[#393939] justify-self-center">
            Status
          </h1>
          <div className="w-full h-0.5 rounded-full bg-[#B1B1B1] col-span-5 flex flex-col" />

          <div className="grid grid-cols-5 col-span-5 items-center px-4 py-6 border-b-[1px] border-[#C3C3C3]">
            <div className="">
              <h1 className="font-hind font-bold">
                Image of {listOfOrders?.OC_BuyerFullName}
              </h1>
            </div>
            <div
              className={`${
                listOfOrders?.OC_Status !== "shipped"
                  ? `col-span-2`
                  : `col-span-1`
              } flex flex-col gap-0.5`}
            >
              <p className="font-hind font-bold text-[#006B95]">
                Seller: {listOfOrders?.OC_SellerFullName}
              </p>
              <h1 className="font-montserrat font-bold text-lg">
                {" "}
                {listOfOrders?.OC_Products?.OC_ProductName}
              </h1>
              <div className="flex flex-row items-center gap-4">
                <Image
                  src={`/${listOfOrders?.OC_PaymentMethod} Image.svg`}
                  alt={`${listOfOrders?.OC_PaymentMethod} Image`}
                  height={20}
                  width={20}
                  className="object-contain"
                />
                <p className="font-hind text-xl text-[#232323]">
                  {listOfOrders?.OC_PaymentMethod}
                </p>
              </div>
            </div>
            <div className="justify-self-center font-hind text-[#232323] text-xl font-medium">
              Php {listOfOrders?.OC_TotalPrice}
            </div>
            <div>
              {listOfOrders?.OC_Status === "shipped" ? (
                listOfOrders?.OC_Status
              ) : (
                <div className="flex justify-center">
                  {listOfOrders?.OC_Status === "paid" ? (
                    <Rate
                      value={listOfOrders?.OC_RatingAndFeedback?.rating}
                      disabled
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setModalRate(true)}
                      className="w-fit px-9 py-2 bg-[#006B95] text-white font-montserrat rounded-md font-bold"
                    >
                      Rate
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          <Modal
            centered
            open={modalRate}
            onOk={() => {
              handleRate(
                listOfOrders?.id || "",
                listOfOrders?.OC_BuyerID || "",
                listOfOrders?.OC_SellerID || "",
                listOfOrders?.OC_Products?.OC_ProductName || ""
              );
              setModalRate(false);
            }}
            onCancel={() => setModalRate(false)}
            onClose={() => setModalRate(false)}
          >
            <h1 className="font-montserrat font-bold text-[#006B95]">
              Please rate the product of {listOfOrders?.OC_SellerFullName},{" "}
              {listOfOrders?.OC_Products?.OC_ProductName}:
            </h1>
            <div className="my-4">
              <label
                htmlFor="rateID"
                className="text-[#006B95] font-montserrat mr-10"
              >
                Rate:
              </label>
              <Rate
                id="rateID"
                tooltips={descriptor}
                value={star}
                onChange={setStar}
              />
            </div>
            <div className="flex flex-col my-4">
              <label
                htmlFor="commentID"
                className="text-[#006B95] font-montserrat"
              >
                Feedback:
              </label>
              <textarea
                name="comments"
                id="commentID"
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="border-[#C3C3C3] border-[1px] rounded-lg resize-none outline-none drop-shadow-md p-4 font-hind font-medium"
              />
            </div>
          </Modal>
        </div>
      </div>
    </div>
  );
}
