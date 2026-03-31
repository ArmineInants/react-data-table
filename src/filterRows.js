/**
 * Client-side filtering for range keys (`*_from`, `*_to`), date ranges (`*_datefrom`, `*_dateto`),
 * and exact equality for other keys. Matches the behavior of the original deposit table filters.
 *
 * @param {Array<Record<string, unknown>>} rows
 * @param {Record<string, unknown>} filters
 * @returns {Array<Record<string, unknown>>}
 */
export function filterRows(rows, filters) {
  if (!filters || typeof filters !== 'object') {
    return rows;
  }

  let filtered = rows;

  for (const filterKey of Object.keys(filters)) {
    const fromMatch = /(.*)_from$/.exec(filterKey);
    const toMatch = /(.*)_to$/.exec(filterKey);
    const dateFromMatch = /(.*)_datefrom$/.exec(filterKey);
    const dateToMatch = /(.*)_dateto$/.exec(filterKey);

    if (fromMatch) {
      const field = fromMatch[1];
      if (filters[filterKey] === '' || filters[filterKey] == null) continue;
      filtered = filtered.filter((row) => {
        const v = row[field];
        return parseFloat(v) >= parseFloat(filters[filterKey]);
      });
    } else if (toMatch) {
      const field = toMatch[1];
      if (filters[filterKey] === '' || filters[filterKey] == null) continue;
      filtered = filtered.filter((row) => {
        const v = row[field];
        return parseFloat(v) <= parseFloat(filters[filterKey]);
      });
    } else if (dateFromMatch) {
      const field = dateFromMatch[1];
      if (!filters[filterKey]) continue;
      filtered = filtered.filter((row) => {
        const v = row[field];
        if (v == null) return false;
        const dateStr = String(v).slice(0, 10);
        return dateStr >= filters[filterKey];
      });
    } else if (dateToMatch) {
      const field = dateToMatch[1];
      if (!filters[filterKey]) continue;
      filtered = filtered.filter((row) => {
        const v = row[field];
        if (v == null) return false;
        const dateStr = String(v).slice(0, 10);
        return filters[filterKey] >= dateStr;
      });
    } else {
      if (filters[filterKey] === '' || filters[filterKey] == null) continue;
      filtered = filtered.filter((row) => row[filterKey] == filters[filterKey]);
    }
  }

  return filtered;
}
