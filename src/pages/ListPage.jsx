import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, STATUSES, PAGE_SIZES } from '../api.js';

export function ErrorBanner({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="error">
      <span>{message}</span>
      <button onClick={onClose} aria-label="Dismiss error">×</button>
    </div>
  );
}

function pageWindow(current, total, width = 5) {
  if (total <= 0) return [];
  const half = Math.floor(width / 2);
  let start = Math.max(0, current - half);
  const end = Math.min(total, start + width);
  start = Math.max(0, end - width);
  const pages = [];
  for (let i = start; i < end; i += 1) pages.push(i);
  return pages;
}

export default function ListPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(
    async (pageArg = page, sizeArg = size, statusArg = status, qArg = query) => {
      setLoading(true);
      setError('');
      try {
        const data = await api.list({
          status: statusArg || undefined,
          q: qArg || undefined,
          page: pageArg,
          size: sizeArg
        });
        setTickets(data.content || []);
        setPage(data.page ?? pageArg);
        setSize(data.size ?? sizeArg);
        setTotalElements(data.totalElements ?? (data.content || []).length);
        setTotalPages(data.totalPages ?? 1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [page, size, status, query]
  );

  useEffect(() => {
    refresh(0, size, '', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyFilters() {
    setPage(0);
    refresh(0, size, status, query);
  }

  function resetFilters() {
    setStatus('');
    setQuery('');
    setPage(0);
    refresh(0, size, '', '');
  }

  function changeSize(nextSize) {
    setSize(nextSize);
    setPage(0);
    refresh(0, nextSize, status, query);
  }

  function goTo(nextPage) {
    const clamped = Math.max(0, Math.min(nextPage, Math.max(0, totalPages - 1)));
    setPage(clamped);
    refresh(clamped, size, status, query);
  }

  const from = totalElements === 0 ? 0 : page * size + 1;
  const to = Math.min(totalElements, page * size + tickets.length);

  return (
    <div>
      <ErrorBanner message={error} onClose={() => setError('')} />

      <div className="card">
        <h2>Tickets</h2>
        <div className="row">
          <label>
            Search
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="keyword in title/description"
            />
          </label>
          <label>
            Status filter
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <button onClick={applyFilters}>Apply</button>
          <button className="secondary" onClick={resetFilters}>Reset</button>
          <Link to="/create"><button type="button">+ New ticket</button></Link>
        </div>

        {loading ? (
          <p>Loading…</p>
        ) : tickets.length === 0 ? (
          <p>No tickets yet. <Link to="/create">Create one</Link>.</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assignee</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} onClick={() => navigate(`/tickets/${t.id}`)} className="clickable">
                    <td>{t.id}</td>
                    <td>{t.title}</td>
                    <td><span className={`pill ${t.status}`}>{t.status}</span></td>
                    <td>{t.priority}</td>
                    <td>{t.assignee || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="row" style={{ marginTop: 12 }}>
              <span className="meta">
                Showing {from}–{to} of {totalElements} · page {totalPages === 0 ? 0 : page + 1} of {totalPages}
              </span>
              <span style={{ flex: 1 }} />
              <label style={{ minWidth: 120, maxWidth: 160 }}>
                Page size
                <select value={size} onChange={(e) => changeSize(Number(e.target.value))}>
                  {PAGE_SIZES.map((s) => (
                    <option key={s} value={s}>{s} / page</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="row">
              <button className="secondary" disabled={page <= 0} onClick={() => goTo(page - 1)}>
                ← Prev
              </button>
              {pageWindow(page, totalPages).map((p) => (
                <button
                  key={p}
                  className={p === page ? '' : 'secondary'}
                  disabled={p === page}
                  onClick={() => goTo(p)}
                >
                  {p + 1}
                </button>
              ))}
              <button
                className="secondary"
                disabled={page >= totalPages - 1 || totalPages === 0}
                onClick={() => goTo(page + 1)}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
