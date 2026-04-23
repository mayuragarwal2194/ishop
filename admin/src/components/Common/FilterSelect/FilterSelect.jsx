export default function FilterSelect({
  value,
  onChange,
  options = [],
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-(--card) border border-(--border) rounded-lg px-3 pr-10 py-2 outline-none text-(--text) cursor-pointer"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="cursor-pointer">
            {option.label}
          </option>
        ))}
      </select>

      <i className="ri-arrow-down-s-line absolute right-3 top-1/2 -translate-y-1/2 text-(--subText) pointer-events-none"></i>
    </div>
  );
}