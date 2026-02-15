import { useState } from "react";

export default function SkillsLanguagesSelect({
  label,
  options = [],
  selected = [],
  setSelected
}) {
  const [open, setOpen] = useState(false);

  const toggleOption = (option) => {
    if (selected.includes(option)) {
      setSelected(selected.filter((item) => item !== option));
    } else {
      setSelected([...selected, option]);
    }
  };

  return (
    <div className="mb-6 relative">
      <label className="block text-gray-700 font-semibold mb-2">
        {label}
      </label>

      {/* Selected Box */}
      <div
        onClick={() => setOpen(!open)}
        className="min-h-[45px] border rounded-lg p-2 flex flex-wrap gap-2 cursor-pointer bg-white"
      >
        {selected.length === 0 ? (
          <span className="text-gray-400 text-sm">
            Select {label}
          </span>
        ) : (
          selected.map((item) => (
            <span
              key={item}
              className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              {item}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOption(item);
                }}
                className="text-blue-600 font-bold"
              >
                ×
              </button>
            </span>
          ))
        )}
      </div>

      {/* Dropdown Options */}
      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option}
              onClick={() => toggleOption(option)}
              className={`px-4 py-2 cursor-pointer hover:bg-blue-50 flex items-center gap-2 ${
                selected.includes(option) ? "bg-blue-100" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                readOnly
              />
              <span>{option}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}