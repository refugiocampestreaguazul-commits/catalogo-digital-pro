import { Suspense } from "react";
import SuccessClient from "./SuccessClient";

export default function Page() {
  return (
    <Suspense fallback={<p className="p-6">Cargando pedido...</p>}>
      <SuccessClient />
    </Suspense>
  );
}