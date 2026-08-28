"use client";

import { useState } from "react";
import AddCreditCardModal from "@/components/AddCreditCardModal";

export default function CreditCards() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-800 font-bold text-white p-2 rounded-xl hover:bg-green-900 transition-colors cursor-pointer"
        >
          Add
        </button>
      </div>

      {/* All credit cards */}
      <div className="flex flex-col gap-4 mt-4">

      </div>

      <AddCreditCardModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
