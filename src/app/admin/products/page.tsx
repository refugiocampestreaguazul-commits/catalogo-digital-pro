"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useCart } from "../../../context/CartContext";

export default function Home() {
  const [productos, setProductos] = useState<any[]>([]);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState("todos");

  const { cart, addToCart } = useCart();

  // 🛒 TOAST (feedback tipo Amazon)
  const [toast, setToast] = useState("");

  // 🛒 TOTAL ITEMS
  const totalItems = cart.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  // 📦 CARGAR PRODUCTOS
  useEffect(() => {
    const fetchProductos = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_images(*)");

      if (error) {
        setError(error);
        setLoading(false);
        return;
      }

      setProductos(data || []);
      setLoading(false);
    };

    fetchProductos();
  }, []);

  // 🔎 FILTROS
  const productosFiltrados = productos.filter((p) => {
    const nombre = (p?.name || "").toLowerCase();
    const categoriaProd = p?.category || "";

    return (
      nombre.includes(busqueda.toLowerCase()) &&
      (categoria === "todos" || categoriaProd === categoria)
    );
  });

  const categorias = [
    "todos",
    ...Array.from(
      new Set(productos.map((p) => p?.category).filter(Boolean))
    ),
  ];

  // ⏳ LOADING
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <h1 className="text-xl font-semibold">
          Cargando catálogo...
        </h1>
      </main>
    );
  }

  // ❌ ERROR
  if (error) {
    return (
      <main className="min-h-screen p-6">
        <h1 className="text-2xl font-bold text-red-600">
          Error al cargar productos
        </h1>
        <pre className="mt-4 bg-red-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(error, null, 2)}
        </pre>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* 🛒 TOAST AMAZON STYLE */}
        {toast && (
          <div className="fixed top-5 right-5 bg-black text-white px-4 py-2 rounded-lg shadow-lg animate-bounce z-50">
            {toast}
          </div>
        )}

        {/* 🛍️ HEADER PRO */}
        <div className="flex justify-between items-center mb-6 bg-yellow-400 p-4 rounded-lg">

          <h1 className="text-xl font-bold">
            🛒 Catálogo PRO
          </h1>

          <a href="/cart" className="relative text-2xl">
            🛍️

            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full px-2">
                {totalItems}
              </span>
            )}
          </a>

        </div>

        {/* 🔎 BUSCADOR */}
        <input
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full p-3 mb-4 border rounded-lg"
        />

        {/* 📂 CATEGORÍAS */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoria(cat)}
              className={`px-4 py-2 rounded-full border transition ${
                categoria === cat
                  ? "bg-black text-white"
                  : "bg-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 📦 PRODUCTOS */}
        <div className="grid md:grid-cols-3 gap-6">

          {productosFiltrados.length === 0 ? (
            <p className="text-center col-span-3 text-gray-500">
              No hay productos disponibles
            </p>
          ) : (
            productosFiltrados.map((producto) => (
              <div
                key={producto.id}
                className="bg-white rounded-xl shadow-md p-5 hover:shadow-xl transition transform hover:-translate-y-1"
              >

                {/* 🖼 IMAGEN */}
                {producto.product_images &&
                producto.product_images.length > 0 ? (
                  <img
                    src={producto.product_images[0].image_url}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                ) : producto.image_url ? (
                  <img
                    src={producto.image_url}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                ) : (
                  <div className="h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-500">
                    Sin imagen
                  </div>
                )}

                {/* INFO */}
                <h2 className="text-xl font-bold">
                  {producto.name}
                </h2>

                <p className="text-gray-600 mt-2">
                  {producto.description}
                </p>

                <p className="text-green-600 font-bold text-2xl mt-3">
                  ${producto.price}
                </p>

                {/* WHATSAPP */}
                <a
                  href={`https://wa.me/573105973951?text=Hola, me interesa el producto: ${producto.name}`}
                  target="_blank"
                  className="block mt-4 bg-green-600 text-white text-center py-2 rounded-lg hover:bg-green-700 transition"
                >
                  Comprar por WhatsApp
                </a>

                {/* 🛒 BOTÓN AMAZON STYLE */}
                <button
                  onClick={() => {
                    addToCart({
                      id: producto.id,
                      name: producto.name,
                      price: producto.price,
                      image:
                        producto.product_images?.[0]?.image_url ||
                        producto.image_url,
                      quantity: 1,
                    });

                    setToast("🛒 Agregado al carrito");

                    setTimeout(() => setToast(""), 1500);
                  }}
                  className="w-full mt-2 flex items-center justify-center gap-2 bg-black text-white py-2 rounded-lg hover:bg-gray-800 active:scale-95 transition"
                >
                  🛒 Agregar al carrito
                </button>

              </div>
            ))
          )}

        </div>

      </div>
    </main>
  );
}