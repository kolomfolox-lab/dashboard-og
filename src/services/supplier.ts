export interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  is_active: boolean;
  products: SupplierProduct[];
}

export interface SupplierProduct {
  id: string;
  supplier: string;
  name: string;
  unit: string;
  price: string;
  min_order_qty: string;
  delivery_lead_days: number;
  is_active: boolean;
}

export interface PurchaseOrderItem {
  id: string;
  order: string;
  product: string;
  product_name: string;
  quantity: string;
  unit_price: string;
  received_quantity: string | null;
  total_price: string;
}

export interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier: string;
  supplier_name: string;
  status: 'DRAFT' | 'SENT' | 'CONFIRMED' | 'SHIPPED' | 'RECEIVED' | 'CANCELLED';
  total_amount: string;
  notes: string;
  expected_date: string | null;
  received_date: string | null;
  created_at: string;
  items: PurchaseOrderItem[];
}
