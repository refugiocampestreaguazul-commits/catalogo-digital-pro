"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router]);

  const menu = [
    { name: "Dashboard", path: "/admin" },
    { name: "Productos", path: "/admin/products" },
    { name: "Pedidos", path: "/admin/orders" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">

      <aside className="w-64 bg-black text-white p-4 hidden sm:block">
        <h1 className="text-xl font-bold mb-6">
          🛒 Admin PRO
        </h1>

        <nav className="flex flex-col gap-2">
          {menu.map((item) => {
            const active = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`p-2 rounded ${
                  active ? "bg-white text-black" : "hover:bg-gray-800"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 p-4">
        {children}
      </main>

    </div>
  );
}