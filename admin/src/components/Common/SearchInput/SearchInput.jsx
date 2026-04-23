export default function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
}) {
  return (
    <div className="relative w-full">
      <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-(--subText)"></i>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-(--card) border border-(--border) rounded-lg pl-10 pr-4 py-2.5 outline-none focus:border-(--primary) text-(--text)"
      />
    </div>
  );
}