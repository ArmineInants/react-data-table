/**
 * URL-agnostic pagination: use callbacks.
 *
 * @param {object} props
 * @param {number} props.currentPage
 * @param {number} props.totalPages
 * @param {(page: number) => void} props.onPageChange
 * @param {string} [props.className]
 * @param {(page: number) => string} [props.getPageHref]
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) {
  if (totalPages <= 1) {
    return null;
  }

  const pagesList = [];
  for (let i = 1; i <= totalPages; i += 1) {
    pagesList.push(i);
  }

  const go = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  const PageControl = ({ page, children }) => {
    const active = page === currentPage;

    return (
      <li className={active ? 'active' : 'waves-effect'}>
        <button
          type="button"
          onClick={() => go(page)}
          aria-current={active ? 'page' : undefined}
        >
          {children}
        </button>
      </li>
    );
  };

  return (
    <div className={`pagination react-data-table-pagination ${className}`.trim()}>
      <ul className="pagination right">
        {currentPage === 1 ? (
          <li className="disabled">
            <span className="react-data-table-pagination__nav" aria-hidden="true">
              ‹
            </span>
          </li>
        ) : (
          <li className="waves-effect">
            <button type="button" onClick={() => go(currentPage - 1)} aria-label="Previous page">
              ‹
            </button>
          </li>
        )}
        {pagesList.map((page) => (
          <PageControl key={page} page={page}>
            {page}
          </PageControl>
        ))}
        {currentPage === totalPages ? (
          <li className="disabled">
            <span className="react-data-table-pagination__nav" aria-hidden="true">
              ›
            </span>
          </li>
        ) : (
          <li className="waves-effect">
            <button type="button" onClick={() => go(currentPage + 1)} aria-label="Next page">
              ›
            </button>
          </li>
        )}
      </ul>
    </div>
  );
}
