"use client";

import { useState } from "react";
import AddBankAccountModal from "@/components/AddBankAccountModal";

export default function Home() {
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

      {/* All bank accounts */}
      <div className="flex flex-col gap-4 mt-4">

      </div>

      <AddBankAccountModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
