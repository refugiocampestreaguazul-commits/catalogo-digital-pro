"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get("id");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { width, height } = useWindowSize();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", orderId)
        .single();

      if (error) {
        console.log(error);
        setLoading(false);
        return;
      }

      setOrder(data);
      setLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Cargando pedido...</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Pedido no encontrado</p>
      </main>
    );
  }

  const whatsappText = `
🛒 *Pedido confirmado*

📦 Orden: ${order.order_code}
👤 Cliente: ${order.customer_name}
📞 Tel: ${order.customer_phone}
💰 Total: $${order.total}

Gracias por tu compra 🙌
`;

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <Confetti width={width} height={height} />

      <div className="bg-white p-6 rounded-xl shadow max-w-xl w-full">

        {/* HEADER */}
        <div className="text-center mb-4">
          <div className="text-5xl mb-2">🎉</div>

          <h1 className="text-2xl font-bold text-green-600">
            ¡Compra realizada con éxito!
          </h1>

          <p className="text-gray-600">
            Orden #{order.order_code}
          </p>

          <div className="mt-2">
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
              Estado: {order.status || "pendiente"}
            </span>
          </div>
        </div>

        {/* INFO */}
        <div className="mb-4">
          <p><b>Cliente:</b> {order.customer_name}</p>
          <p><b>Teléfono:</b> {order.customer_phone}</p>
          <p className="text-green-600 font-bold text-lg mt-2">
            Total: ${order.total}
          </p>
        </div>

        {/* PRODUCTOS */}
        <div className="border-t pt-3">
          <h2 className="font-bold mb-2">Productos:</h2>

          {order.order_items?.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm mb-1">
              <span>{item.name} x {item.quantity}</span>
              <span>${item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        {/* WHATSAPP */}
        <a
          href={`https://wa.me/573105973951?text=${encodeURIComponent(
            whatsappText
          )}`}
          target="_blank"
          className="block mt-5 bg-green-600 text-white text-center py-3 rounded-lg hover:bg-green-700 transition"
        >
          💬 Enviar pedido por WhatsApp
        </a>

        {/* HOME */}
        <button
          onClick={() => router.push("/")}
          className="w-full mt-3 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
        >
          🏠 Volver a la tienda
        </button>

      </div>
    </main>
  );
}