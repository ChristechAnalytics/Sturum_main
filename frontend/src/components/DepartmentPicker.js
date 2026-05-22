import React, { useState, useEffect, useRef, useMemo } from "react";
import { FaSearch, FaChevronDown } from "react-icons/fa";
import API_URL from "../config";

const DepartmentPicker = ({ value, onChange, required = true, id = "department" }) => {
  const [query, setQuery] = useState("");
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/departments/all`);
        if (!response.ok) throw new Error("Failed to load departments");
        const data = await response.json();
        setDepartments(data.departments || []);
        setCategories(data.categories || []);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (value && !query) {
      setQuery(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return departments;
    return departments.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q)
    );
  }, [departments, query]);

  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach((d) => {
      if (!groups[d.category]) groups[d.category] = [];
      groups[d.category].push(d);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const handleSelect = (name) => {
    onChange(name);
    setQuery(name);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setIsOpen(true);
    if (!e.target.value) {
      onChange("");
    }
  };

  return (
    <div ref={containerRef} className="relative mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        Department {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm pointer-events-none" />
        <input
          id={id}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Search for your department..."
          autoComplete="off"
          required={required && !value}
          className="w-full pl-10 pr-10 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          role="combobox"
        />
        <button
          type="button"
          onClick={() => setIsOpen((o) => !o)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-primary-600"
          aria-label="Toggle department list"
        >
          <FaChevronDown className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </div>

      {loading && (
        <p className="text-sm text-neutral-500 mt-1">Loading departments...</p>
      )}
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}

      {isOpen && !loading && (
        <ul
          className="absolute z-50 w-full mt-1 max-h-64 overflow-y-auto bg-white border-2 border-neutral-200 rounded-lg shadow-lg"
          role="listbox"
        >
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-neutral-500 text-sm">
              No departments match &quot;{query}&quot;
            </li>
          ) : (
            grouped.map(([category, items]) => (
              <li key={category}>
                <div className="px-3 py-2 text-xs font-semibold text-primary-700 bg-primary-50 sticky top-0">
                  {category}
                </div>
                <ul>
                  {items.map((dept) => (
                    <li key={dept.name}>
                      <button
                        type="button"
                        onClick={() => handleSelect(dept.name)}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-primary-50 transition-colors ${
                          value === dept.name
                            ? "bg-primary-100 text-primary-800 font-medium"
                            : "text-neutral-800"
                        }`}
                        role="option"
                        aria-selected={value === dept.name}
                      >
                        {dept.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))
          )}
        </ul>
      )}

      {value && (
        <p className="text-xs text-neutral-500 mt-1">
          Selected: <span className="font-medium text-neutral-700">{value}</span>
        </p>
      )}

      {!value && categories.length > 0 && !isOpen && (
        <p className="text-xs text-neutral-500 mt-1">
          {departments.length} departments across {categories.length} fields — type to search
        </p>
      )}
    </div>
  );
};

export default DepartmentPicker;
