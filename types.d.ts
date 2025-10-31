import dayjs from "dayjs";

type Offer = {
  id: string;
  sitting_service_address: string;
  sitting_service_createdAt: dayjs;
  sitting_service_endDate: dayjs;
  sitting_service_payment_type: string;
  sitting_service_price: number;
  sitting_service_requester_email: string;
  sitting_service_requester_id: string;
  sitting_service_requester_name: string;
  sitting_service_startDate: dayjs;
  sitting_service_status: string;
};

type Requester = {
  id: string;
  sitting_service_address: string;
  sitting_service_createdAt: dayjs;
  sitting_service_endDate: dayjs;
  sitting_service_feedback_and_rate: {
    feedback: string;
    rate: number;
  };
  sitting_service_isNewCustomer: boolean;
  sitting_service_offering_id: string;
  sitting_service_payment_type: string;
  sitting_service_price: number;
  sitting_service_provider_email: string;
  sitting_service_provider_id: string;
  sitting_service_provider_name: string;
  sitting_service_requester_email: string;
  sitting_service_requester_id: string;
  sitting_service_requester_name: string;
  sitting_service_startDate: dayjs;
  sitting_service_endDate: dayjs;
  sitting_service_status: string;
};
