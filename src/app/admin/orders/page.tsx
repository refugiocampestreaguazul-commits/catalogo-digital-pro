"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRef } from "react";

export default function OrdersAdmin() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [newOrderId, setNewOrderId] = useState<string | null>(null);
const audioRef = useRef<HTMLAudioElement | null>(null);

  // 📦 CARGAR PEDIDOS
  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => {
  fetchOrders();

  const channel = supabase
    .channel("orders-realtime")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "orders" },
      () => {
        fetchOrders();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);

  // 🔄 CAMBIAR ESTADO
  const updateStatus = async (id: string, status: string) => {
    await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    fetchOrders();
  };

  // 🔎 FILTRO
  const filtered = orders.filter((o) =>
    (o.order_code || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        Cargando pedidos...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">

      {/* HEADER */}
      <div className="bg-white p-4 rounded-xl shadow mb-4 flex flex-col sm:flex-row justify-between gap-2">

        <h1 className="text-xl font-bold">
          📦 Panel de Pedidos PRO
        </h1>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar orden..."
          className="p-2 border rounded w-full sm:w-64"
        />

      </div>

      {/* LISTA */}
      <div className="grid gap-4">

        {filtered.map((order) => (
          <div
            key={order.id}
            className="bg-white p-4 rounded-xl shadow"
          >

            {/* HEADER ORDER */}
            <div className="flex justify-between items-center">
              <h2 className="font-bold">
                Orden #{order.order_code}
              </h2>

              <span className={`px-3 py-1 rounded-full text-sm ${
                order.status === "entregado"
                  ? "bg-green-100 text-green-700"
                  : order.status === "enviado"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}>
                {order.status}
              </span>
            </div>

            {/* INFO */}
            <p className="text-sm text-gray-600 mt-1">
              Cliente: {order.customer_name} | {order.customer_phone}
            </p>

            <p className="font-bold text-green-600 mt-1">
              Total: ${order.total}
            </p>

            {/* PRODUCTOS */}
            <div className="mt-2 text-sm text-gray-700">
              {order.order_items?.map((item: any) => (
                <div key={item.id}>
                  • {item.name} x {item.quantity}
                </div>
              ))}
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 mt-3 flex-wrap">

              <button
                onClick={() => updateStatus(order.id, "pendiente")}
                className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded"
              >
                Pendiente
              </button>

              <button
                onClick={() => updateStatus(order.id, "enviado")}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded"
              >
                Enviado
              </button>

              <button
                onClick={() => updateStatus(order.id, "entregado")}
                className="px-3 py-1 bg-green-100 text-green-700 rounded"
              >
                Entregado
              </button>

            </div>

          </div>
        ))}

      </div>
    </div>
  );
}