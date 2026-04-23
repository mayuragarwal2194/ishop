export default function SortSelect({ value, onChange }) {
  const options = [
    { label: "Newest", value: "newest" },
    { label: "Oldest", value: "oldest" },
    { label: "Name (A-Z)", value: "name_asc" },
    { label: "Name (Z-A)", value: "name_desc" },
  ];

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-(--card) border border-(--border) rounded-lg px-3 pr-10 py-2 outline-none text-(--text) cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            Sort: {opt.label}
          </option>
        ))}
      </select>
      <i className="ri-arrow-down-s-line absolute right-3 top-1/2 -translate-y-1/2 text-(--subText) pointer-events-none"></i>
    </div>
  );
}
