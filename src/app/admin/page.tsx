"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Trash2, Pencil, Plus, X } from "lucide-react";

export default function Admin() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
const [filter, setFilter] = useState("todos");

  const [images, setImages] = useState<string[]>([]);
  const [selectedImageByProduct, setSelectedImageByProduct] = useState<any>({});

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");

  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // 📸 upload múltiple
  const handleMultipleUpload = async (e: any) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const fileName = `${Date.now()}-${file.name}`;

      const { error } = await supabase.storage
        .from("products")
        .upload(fileName, file);

      if (!error) {
        const { data } = supabase.storage
          .from("products")
          .getPublicUrl(fileName);

        uploadedUrls.push(data.publicUrl);
      }
    }

    setImages(uploadedUrls);
    setUploading(false);
  };

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*, product_images(*)")
      .order("id", { ascending: false });

    setProducts(data || []);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const validate = () => {
    if (!name.trim()) return alert("Nombre obligatorio");
    if (!price || isNaN(Number(price))) return alert("Precio inválido");
    return true;
  };

  const createProduct = async () => {
    if (!validate()) return;

    setLoading(true);

    const { data: product } = await supabase
      .from("products")
      .insert([
        {
          name,
          description,
          price: Number(price),
          category,
        },
      ])
      .select()
      .single();

    if (product && images.length > 0) {
      await supabase.from("product_images").insert(
        images.map((img) => ({
          product_id: product.id,
          image_url: img,
        }))
      );
    }

    setLoading(false);
    clearForm();
    fetchProducts();
  };

  const updateProduct = async () => {
    if (!validate()) return;

    setLoading(true);

    await supabase
      .from("products")
      .update({
        name,
        description,
        price: Number(price),
        category,
      })
      .eq("id", editId);

    setLoading(false);
    clearForm();
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("¿Eliminar producto?")) return;

    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  };

  const startEdit = (p: any) => {
    setName(p.name);
    setDescription(p.description);
    setPrice(p.price);
    setCategory(p.category);
    setEditId(p.id);
    setImages([]);
    setShowForm(true);
  };

  const clearForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setCategory("");
    setImages([]);
    setEditId(null);
    setShowForm(false);
  };

const filteredProducts = products.filter((p) => {
  const matchName = p.name.toLowerCase().includes(search.toLowerCase());

  const matchCategory =
    filter === "todos" || p.category === filter;

  return matchName && matchCategory;
});

  return (
    <main className="min-h-screen bg-gray-100">

      {/* HEADER RESPONSIVE */}
      <div className="sticky top-0 bg-white shadow p-3 flex flex-col sm:flex-row gap-2 justify-between items-center z-10">
      <p className="text-sm text-gray-500">
  Productos: {products.length}
</p>
  <h1 className="text-lg sm:text-2xl font-bold">
    🛒 Admin Catalogo PRO
  </h1>

  <div className="flex gap-2 w-full sm:w-auto">

    {/* SEARCH */}
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Buscar producto..."
      className="p-2 border rounded w-full sm:w-64"
    />

    {/* BUTTON */}
    <button
      onClick={() => setShowForm(true)}
      className="bg-black text-white px-3 py-2 rounded"
    >
      <Plus size={18} />
    </button>

  </div>
</div>
<div className="p-3 flex gap-2 flex-wrap">

  {["todos", ...new Set(products.map(p => p.category))].map((cat) => (
    <button
      key={cat}
      onClick={() => setFilter(cat)}
      className={`px-3 py-1 rounded-full border text-sm ${
        filter === cat ? "bg-black text-white" : "bg-white"
      }`}
    >
      {cat}
    </button>
  ))}

</div>
      <div className="p-3 sm:p-6">

        {/* FORM RESPONSIVE */}
        {showForm && (
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow mb-6 relative">

            <button onClick={clearForm} className="absolute top-2 right-2">
              <X />
            </button>

            <input
              className="w-full p-2 border mb-2 rounded"
              placeholder="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <textarea
              className="w-full p-2 border mb-2 rounded"
              placeholder="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                className="p-2 border rounded"
                placeholder="Precio"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />

              <input
                className="p-2 border rounded"
                placeholder="Categoría"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleMultipleUpload}
              className="w-full p-2 border mt-3 rounded"
            />

            {/* PREVIEW */}
            {images.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-3">
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    className="h-14 w-full object-cover rounded"
                  />
                ))}
              </div>
            )}

            {uploading && (
              <p className="text-sm text-gray-500 mt-2">
                Subiendo imágenes...
              </p>
            )}

            <button
              onClick={editId ? updateProduct : createProduct}
              className="bg-black text-white w-full mt-4 p-3 rounded-lg"
            >
              {editId ? "Actualizar" : "Guardar"}
            </button>
          </div>
        )}

        {/* GRID RESPONSIVE REAL */}
        <div className="
          grid 
          grid-cols-1 
          sm:grid-cols-2 
          md:grid-cols-3 
          lg:grid-cols-4 
          gap-4
        ">

          {filteredProducts.map((p) => {
            const imgs = p.product_images || [];
            const main =
              selectedImageByProduct[p.id] ||
              imgs[0]?.image_url;

            return (
              <div
                key={p.id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
              >

                {/* IMAGE */}
                {main && (
                  <img
                    src={main}
                    className="w-full h-40 object-cover"
                  />
                )}

                {/* THUMBS */}
                <div className="flex gap-1 p-2 overflow-x-auto">
                  {imgs.map((img: any) => (
                    <img
                      key={img.id}
                      src={img.image_url}
                      onClick={() =>
                        setSelectedImageByProduct((prev: any) => ({
                          ...prev,
                          [p.id]: img.image_url,
                        }))
                      }
                      className="w-10 h-10 object-cover rounded border cursor-pointer flex-shrink-0"
                    />
                  ))}
                </div>

                {/* INFO */}
                <div className="p-3">
                  <h2 className="font-semibold">{p.name}</h2>

                  <p className="text-xs text-gray-500 line-clamp-2">
                    {p.description}
                  </p>

                  <p className="text-green-600 font-bold mt-1">
                    ${p.price}
                  </p>

                  <p className="text-xs text-gray-400">
                    {p.category}
                  </p>

                  {/* ACTIONS */}
                  <div className="flex justify-between mt-3">

                    <button onClick={() => startEdit(p)}>
                      <Pencil size={18} className="text-blue-600" />
                    </button>

                    <button onClick={() => deleteProduct(p.id)}>
                      <Trash2 size={18} className="text-red-600" />
                    </button>

                  </div>

                </div>

              </div>
            );
          })}

        </div>

      </div>
    </main>
  );
}