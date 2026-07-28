"use client";

import { useState } from "react";

export function SearchBar({ onSearch, initialValue = "" }: { onSearch: (query: string) => void; initialValue?: string }) {
  const [value, setValue] = useState(initialValue);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(value);
      }}
      className="flex w-full items-center gap-2 rounded-full border border-gray-200 bg-white p-1.5 shadow-card dark:border-gray-700 dark:bg-gray-900"
    >
      <span className="pl-3 text-gray-400">🔎</span>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder='Ex : "appartement pour 4 étudiants à moins de 400€ par personne, proche du métro"'
        className="flex-1 border-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-gray-400"
      />
      <button type="submit" className="btn-primary">
        Rechercher
      </button>
    </form>
  );
}
