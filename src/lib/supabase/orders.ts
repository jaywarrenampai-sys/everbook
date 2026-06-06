import { supabase } from "./client";

export interface ShippingAddress {
  fullName:    string;
  phone:       string;
  addressLine: string;
  subDistrict: string;
  district:    string;
  province:    string;
  postalCode:  string;
}

export interface CreateOrderInput {
  projectId:   string | null;
  quantity:    number;
  unitPrice:   number;
  totalPrice:  number;
  pageCount:   number;
  shipping:    ShippingAddress;
  paymentMethod: string;
}

export interface Order {
  id:             string;
  project_id:     string | null;
  quantity:       number;
  unit_price:     number;
  total_price:    number;
  page_count:     number;
  full_name:      string;
  phone:          string;
  address_line:   string;
  sub_district:   string;
  district:       string;
  province:       string;
  postal_code:    string;
  status:         string;
  payment_method: string | null;
  created_at:     string;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      project_id:     input.projectId,
      quantity:       input.quantity,
      unit_price:     input.unitPrice,
      total_price:    input.totalPrice,
      page_count:     input.pageCount,
      full_name:      input.shipping.fullName,
      phone:          input.shipping.phone,
      address_line:   input.shipping.addressLine,
      sub_district:   input.shipping.subDistrict,
      district:       input.shipping.district,
      province:       input.shipping.province,
      postal_code:    input.shipping.postalCode,
      status:         "pending_payment",
      payment_method: input.paymentMethod,
    })
    .select()
    .single();

  if (error) throw new Error(`Create order failed: ${error.message}`);
  return data;
}

export async function getOrder(orderId: string): Promise<Order> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error) throw new Error(`Get order failed: ${error.message}`);
  return data;
}
