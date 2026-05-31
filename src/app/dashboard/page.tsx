"use client";

import Link from "next/link";

export default function Dashboard() {
  return (
    <main className="min-h-screen bg-gray-100 p-6">

      <h1 className="text-2xl font-bold mb-6">
        📊 Panel Principal
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <Link href="/admin/products" className="bg-white p-6 rounded-xl shadow">
          🛠 Productos
        </Link>

        <Link href="/admin/orders" className="bg-white p-6 rounded-xl shadow">
          📦 Pedidos
        </Link>

        <Link href="/admin" className="bg-white p-6 rounded-xl shadow">
          ⚙ Configuración
        </Link>

      </div>

    </main>
  );
}