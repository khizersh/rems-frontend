import React, { useState, useEffect } from "react";

const DebouncedSearchDropdown = ({
  setSearch,
  setData,
  dataList = [],
  placeholder = "Search...",
  delay = 3000,
  label= ""
}) => {
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Show dropdown if dataList has items (even initially)
  useEffect(() => {
    if (dataList.length > 0) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [dataList]);

  // Debounce logic to trigger search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (query.trim()) {
        setSearch(query);
      }
    }, delay);

    return () => clearTimeout(handler);
  }, [query, delay, setSearch]);

  const handleSelect = (item) => {
    setQuery(item.name);
    setShowDropdown(false);
    setData(item);
  };

  return (
    <div className="relative w-full">
      <label
        className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
        htmlFor="projectType"
      >
        {label}
      </label>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
        onFocus={() => {
          if (dataList.length > 0) setShowDropdown(true);
        }}
      />

      {showDropdown && dataList.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border mt-1 rounded shadow max-h-60 overflow-y-auto">
          {dataList.map((item, index) => (
            <li
              key={index}
              onClick={() => handleSelect(item)}
              className="px-3 py-2 text-blueGray-500 text-sm hover:bg-blue-100 cursor-pointer transition-all duration-150"
            >
              {item.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DebouncedSearchDropdown;
