/**
 * URL-agnostic pagination: use callbacks. Optional `getPageHref` for link-based navigation (e.g. React Router).
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
  getPageHref
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
    if (getPageHref) {
      return (
        <li className={active ? 'active' : 'waves-effect'} key={page}>
          <a href={getPageHref(page)} onClick={(e) => { e.preventDefault(); go(page); }}>
            {children}
          </a>
        </li>
      );
    }
    return (
      <li
        className={active ? 'active' : 'waves-effect'}
        key={page}
        onClick={() => go(page)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            go(page);
          }
        }}
        role="button"
        tabIndex={0}
      >
        <a href="#">{children}</a>
      </li>
    );
  };

  return (
    <div className={`pagination react-data-table-pagination ${className}`.trim()}>
      <ul className="pagination right">
        {currentPage === 1 ? (
          <li className="disabled">
            <span className="react-data-table-pagination__nav" aria-hidden>
              ‹
            </span>
          </li>
        ) : (
          <li className="waves-effect">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                go(currentPage - 1);
              }}
              aria-label="Previous page"
            >
              ‹
            </a>
          </li>
        )}
        {pagesList.map((page) => (
          <PageControl key={page} page={page}>
            {page}
          </PageControl>
        ))}
        {currentPage === totalPages ? (
          <li className="disabled">
            <span className="react-data-table-pagination__nav" aria-hidden>
              ›
            </span>
          </li>
        ) : (
          <li className="waves-effect">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                go(currentPage + 1);
              }}
              aria-label="Next page"
            >
              ›
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}
