import "./Pagination.css";

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onLimitChange,
}) {
  const startItem =
    totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;

  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">

      {/* LEFT: Info */}
      <div className="text-sm text-(--subText)">
        Showing{" "}
        <span className="font-medium text-(--text)">{startItem}</span> -{" "}
        <span className="font-medium text-(--text)">{endItem}</span> of{" "}
        <span className="font-medium text-(--text)">{totalItems}</span> items
      </div>

      {/* RIGHT: Controls */}
      <div className="flex items-center gap-3">

        {/* Items per page ALWAYS visible */}
        <div className="flex items-center gap-2 text-sm items-per-page">
          <span>Show</span>
          <select
            value={itemsPerPage}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="bg-(--bg) border border-(--border) rounded-lg px-2 py-1 cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* ONLY show Prev/Next if needed */}
        {totalPages > 1 && (
          <>
            <button
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
              className="px-3 py-1.5 border border-(--border) rounded-lg disabled:opacity-50 cursor-pointer"
            >
              Prev
            </button>

            <span className="text-sm text-(--subText)">
              {currentPage} / {totalPages}
            </span>

            <button
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
              className="px-3 py-1.5 border border-(--border) rounded-lg disabled:opacity-50 cursor-pointer"
            >
              Next
            </button>
          </>
        )}
      </div>
    </div>
  );
}