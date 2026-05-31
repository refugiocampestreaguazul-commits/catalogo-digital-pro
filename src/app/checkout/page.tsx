"use client";

import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState("nequi");
  const [loading, setLoading] = useState(false);

  const total = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const createOrderCode = () =>
    "SM-" + Math.floor(100000 + Math.random() * 900000);

  const handleCheckout = async () => {
    if (!name || !phone) return alert("Completa tus datos");
    if (cart.length === 0) return alert("Carrito vacío");

    setLoading(true);

    const orderCode = createOrderCode();

    // 1. crear orden
    const { data: order, error } = await supabase
      .from("orders")
      .insert([
        {
          customer_name: name,
          customer_phone: phone,
          total,
          order_code: orderCode,
          status: method === "nequi" ? "pendiente" : "pagado",
          payment_method: method,
        },
      ])
      .select()
      .single();

    if (error) {
      setLoading(false);
      return alert("Error creando orden");
    }

    // 2. insertar items
    const items = cart.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    }));

    await supabase.from("order_items").insert(items);

    clearCart();
    setLoading(false);

    router.push(`/success?id=${order.id}`);
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">

        <h1 className="text-2xl font-bold mb-4">
          💳 Checkout Demo PRO
        </h1>

        {/* RESUMEN */}
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between mb-2">
            <span>{item.name} x {item.quantity}</span>
            <span>${item.price * item.quantity}</span>
          </div>
        ))}

        <hr className="my-4" />

        <h2 className="font-bold text-xl">
          Total: ${total}
        </h2>

        {/* FORM */}
        <input
          className="w-full p-2 border mt-4 rounded"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full p-2 border mt-2 rounded"
          placeholder="Teléfono"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        {/* MÉTODO DE PAGO (SIMULADO) */}
        <div className="mt-4">
          <h3 className="font-bold mb-2">Método de pago</h3>

          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="nequi">Nequi (simulado)</option>
            <option value="pse">PSE (simulado)</option>
            <option value="tarjeta">Tarjeta (simulado)</option>
          </select>
        </div>

        {/* BOTÓN */}
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full mt-6 bg-black text-white py-3 rounded-lg hover:bg-gray-800"
        >
          {loading ? "Procesando..." : "Finalizar compra"}
        </button>

        <p className="text-xs text-gray-500 mt-2">
          *Demo sin pagos reales - listo para vender sistema
        </p>

      </div>
    </main>
  );
}