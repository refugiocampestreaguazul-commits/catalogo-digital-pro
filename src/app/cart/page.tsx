"use client";

import { useCart } from "../../context/CartContext";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const total = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const createOrder = async () => {
  if (cart.length === 0) return alert("Carrito vacío");
  if (!name || !phone) return alert("Completa tus datos");

  setLoading(true);

  // 🧠 1. GENERAR CÓDIGO DE ORDEN (AQUÍ VA)
  const orderCode = `SM-${Math.floor(100000 + Math.random() * 900000)}`;

  // 🧾 2. CREAR ORDEN EN SUPABASE
  const { data: order, error } = await supabase
    .from("orders")
    .insert([
      {
        order_code: orderCode,
        customer_name: name,
        customer_phone: phone,
        total,
        status: "pendiente",
        payment_status: "pendiente",
      },
    ])
    .select()
    .single();

  if (error) {
    console.log(error);
    setLoading(false);
    return alert("Error creando orden");
  }

  // 🛒 3. GUARDAR ITEMS
  const items = cart.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
  }));

  await supabase.from("order_items").insert(items);

  // 🧹 4. LIMPIAR
  clearCart();
  setName("");
  setPhone("");

  setLoading(false);

  // 🚀 5. IR A SUCCESS
  router.push(`/success?id=${order.id}`);
};

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow">

        <h1 className="text-2xl font-bold mb-4">
          🛒 Checkout
        </h1>

        {/* PRODUCTOS */}
        {cart.length === 0 ? (
          <p className="text-gray-500">Carrito vacío</p>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="flex justify-between mb-2">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>${item.price * item.quantity}</span>
            </div>
          ))
        )}

        <hr className="my-4" />

        <h2 className="text-xl font-bold">
          Total: ${total}
        </h2>

        {/* DATOS CLIENTE */}
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

        {/* BOTÓN FINAL */}
        <button
          onClick={createOrder}
          disabled={loading}
          className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700"
        >
          {loading ? "Procesando..." : "Finalizar compra"}
        </button>

      </div>
    </main>
  );
}