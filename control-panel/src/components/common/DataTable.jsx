import { useMemo, useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { FaSort, FaSortUp, FaSortDown, FaSearch } from 'react-icons/fa';

/**
 * Reusable data table with client-side search, sort, and pagination.
 *
 * Props:
 *  - columns: [{ key, header, sortable?, render?(row), accessor?(row) }]
 *  - data:    array of row objects
 *  - loading: boolean
 *  - pageSize: number (default 10)
 *  - searchable: boolean (default true)
 *  - emptyMessage: string
 *  - toolbar: optional node rendered on the right of the search bar
 */
export default function DataTable({
  columns = [],
  data = [],
  loading = false,
  pageSize = 10,
  searchable = true,
  emptyMessage = 'No records found.',
  toolbar = null,
}) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);

  const valueOf = (row, col) =>
    col.accessor ? col.accessor(row) : row?.[col.key];

  // Filter by search query across all column values.
  const filtered = useMemo(() => {
    if (!query.trim()) return data;
    const q = query.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const v = valueOf(row, col);
        return v != null && String(v).toLowerCase().includes(q);
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, query, columns]);

  // Sort.
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return filtered;
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = valueOf(a, col);
      const bv = valueOf(b, col);
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
    return copy;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, sortKey, sortDir, columns]);

  // Paginate.
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, totalPages);
  const pageRows = sorted.slice((current - 1) * pageSize, current * pageSize);

  const toggleSort = (col) => {
    if (!col.sortable) return;
    if (sortKey === col.key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(col.key);
      setSortDir('asc');
    }
  };

  const sortIcon = (col) => {
    if (!col.sortable) return null;
    if (sortKey !== col.key) return <FaSort className="ms-1 text-muted" />;
    return sortDir === 'asc' ? (
      <FaSortUp className="ms-1" />
    ) : (
      <FaSortDown className="ms-1" />
    );
  };

  return (
    <div className="ah-table-wrap">
      {(searchable || toolbar) && (
        <div className="ah-table-toolbar">
          {searchable ? (
            <div className="position-relative" style={{ maxWidth: 280, flex: 1 }}>
              <FaSearch
                className="position-absolute ah-muted"
                style={{ left: 10, top: 11 }}
              />
              <Form.Control
                size="sm"
                placeholder="Search…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                style={{ paddingLeft: 30 }}
              />
            </div>
          ) : (
            <span />
          )}
          {toolbar}
        </div>
      )}

      <div style={{ overflowX: 'auto' }}>
        <table className="ah-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={col.sortable ? 'sortable' : ''}
                  onClick={() => toggleSort(col)}
                >
                  {col.header}
                  {sortIcon(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="ah-table__empty" colSpan={columns.length}>
                  Loading…
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td className="ah-table__empty" colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageRows.map((row, i) => (
                <tr key={row.id ?? i}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row) : valueOf(row, col) ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="ah-table-footer">
        <span>
          {sorted.length} record{sorted.length === 1 ? '' : 's'}
          {query ? ' (filtered)' : ''}
        </span>
        <div className="d-flex align-items-center gap-2">
          <Button
            size="sm"
            variant="light"
            disabled={current <= 1}
            onClick={() => setPage(current - 1)}
          >
            Prev
          </Button>
          <span>
            Page {current} / {totalPages}
          </span>
          <Button
            size="sm"
            variant="light"
            disabled={current >= totalPages}
            onClick={() => setPage(current + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
