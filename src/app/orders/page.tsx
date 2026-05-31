"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("id", { ascending: false });

      if (error) {
        console.log(error);
        setLoading(false);
        return;
      }

      setOrders(data || []);
      setLoading(false);
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Cargando pedidos...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          📦 Mis pedidos
        </h1>

        {orders.length === 0 ? (
          <p className="text-gray-500">
            No tienes pedidos aún
          </p>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-4 rounded-xl shadow mb-4"
            >

              {/* HEADER ORDER */}
              <div className="flex justify-between mb-2">
                <h2 className="font-bold">
                  Orden #{order.id}
                </h2>

                <span className="text-green-600 font-bold">
                  ${order.total}
                </span>
              </div>

              <p className="text-sm text-gray-500 mb-3">
                Cliente: {order.customer_name} · {order.customer_phone}
              </p>

              {/* ITEMS */}
              <div className="space-y-2">
                {order.order_items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 border-b pb-2"
                  >

                    {item.image && (
                      <img
                        src={item.image}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}

                    <div className="flex-1">
                      <p className="font-medium">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} x ${item.price}
                      </p>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          ))
        )}

      </div>
    </main>
  );
}