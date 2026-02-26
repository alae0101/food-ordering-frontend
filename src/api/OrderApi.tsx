import { Order } from "@/types";
import { useMutation, useQuery } from "react-query";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/api-client";

export const useGetMyOrders = () => {
  const getMyOrdersRequest = async (): Promise<Order[]> => {
    const res = await axiosInstance.get("/api/order");
    return res.data;
  };

  const { data: orders, isLoading, error } = useQuery(
    "fetchMyOrders",
    getMyOrdersRequest,
    {
      enabled: !!localStorage.getItem("session_id"),
      refetchInterval: 5000,
    }
  );

  if (error) {
    const axiosError = error as any;
    if (axiosError.response?.status === 404 || axiosError.response?.status === 401) {
      ["session_id", "user_id", "user_email", "user_name", "user_image"].forEach((k) =>
        localStorage.removeItem(k)
      );
      window.location.reload();
    } else {
      toast.error("Failed to fetch orders");
    }
  }

  return { orders, isLoading };
};

type CheckoutSessionRequest = {
  cartItems: { menuItemId: string; name: string; quantity: string }[];
  deliveryDetails: { email: string; name: string; addressLine1: string; city: string };
  restaurantId: string;
};

export const useCreateCheckoutSession = () => {
  const createCheckoutSessionRequest = async (
    req: CheckoutSessionRequest
  ) => {
    const res = await axiosInstance.post(
      "/api/order/checkout/create-checkout-session",
      req
    );
    return res.data;
  };

  const { mutateAsync: createCheckoutSession, isLoading, error, reset } =
    useMutation(createCheckoutSessionRequest);

  if (error) {
    toast.error((error as Error).toString());
    reset();
  }

  return { createCheckoutSession, isLoading };
};
