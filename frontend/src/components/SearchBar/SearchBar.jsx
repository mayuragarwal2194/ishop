import SearchInput from "./SearchInput";
import CategoryDropdown from "./CategoryDropdown";

export default function SearchBar() {
  return (
    <div className="bg-green">
      <div className="container mx-auto py-4 flex items-center justify-between gap-4">
        {/* Left: Search */}
        <div className="flex items-center bg-white rounded-full px-4 py-2 w-full max-w-150">
          <CategoryDropdown />
          <SearchInput />

          <button className="ml-2">
            <i className="ri-search-line font-bold"></i>
          </button>
        </div>

        {/* Right: Static info */}
        <div className="flex-1 hidden lg:flex gap-6 text-white justify-between fs-14-normal">
          <span>FREE SHIPPING OVER $199</span>
          <span>30 DAYS MONEY BACK</span>
          <span>100% SECURE PAYMENT</span>
        </div>

      </div>
    </div>
  );
}