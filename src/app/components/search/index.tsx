import { useState } from "react";
import { SearchBar } from "../common/search-bar";

export const SearchPage = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="h-full max-h-[calc(100vh-64px)] overflow-y-auto py-4">
      <SearchBar value={search} onChange={setSearch} />
    </div>
  );
};
