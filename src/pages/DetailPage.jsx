import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, STATUSES, allowedNext } from '../api.js';
import { ErrorBanner } from './ListPage.jsx';

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentBody, setCommentBody] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await api.get(id);
        if (!cancelled) setTicket(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  async function transition(next) {
    try {
      const updated = await api.changeStatus(ticket.id, next);
      setTicket(updated);
    } catch (err) {
      setError(err.message);
    }
  }

  async function addComment(e) {
    e.preventDefault();
    try {
      await api.addComment(ticket.id, {
        body: commentBody,
        author: commentAuthor || null
      });
      setCommentBody('');
      const refreshed = await api.get(ticket.id);
      setTicket(refreshed);
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove() {
    if (!window.confirm(`Delete ticket #${ticket.id} — "${ticket.title}"? This cannot be undone.`)) return;
    try {
      await api.remove(ticket.id);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="card"><p>Loading…</p></div>;
  if (!ticket) {
    return (
      <div>
        <ErrorBanner message={error} onClose={() => setError('')} />
        <div className="card">
          <p>Ticket not found.</p>
          <Link to="/">← Back to list</Link>
        </div>
      </div>
    );
  }

  const next = allowedNext(ticket.status);

  return (
    <div>
      <ErrorBanner message={error} onClose={() => setError('')} />
      <div className="card">
        <Link to="/">← Back to list</Link>
        <h2>#{ticket.id} — {ticket.title}</h2>
        <p className="meta">
          Status: <strong>{ticket.status}</strong> · Priority: {ticket.priority} ·
          Assignee: {ticket.assignee || '—'}
        </p>

        <div className="row">
          {STATUSES.map((s) => (
            <button
              key={s}
              disabled={s === ticket.status}
              title={next.includes(s) ? 'Allowed transition' : 'Will be rejected by backend'}
              onClick={() => transition(s)}
              type="button"
            >
              → {s}
            </button>
          ))}
        </div>
        <p className="hint">Allowed next: {next.length ? next.join(', ') : 'none (terminal state)'}. Other buttons demonstrate backend rejection.</p>

        <div className="row">
          <Link to={`/tickets/${ticket.id}/edit`}><button type="button">Edit</button></Link>
          <button type="button" className="secondary" onClick={remove}>Delete</button>
        </div>

        <h3>Comments ({ticket.comments?.length || 0})</h3>
        <ul className="comments">
          {(ticket.comments || []).map((c) => (
            <li key={c.id}>
              <strong>{c.author || 'anonymous'}</strong>{' '}
              <span className="meta">{new Date(c.createdAt).toLocaleString()}</span>
              <p>{c.body}</p>
            </li>
          ))}
        </ul>
        <form onSubmit={addComment}>
          <label>
            New comment*
            <textarea
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              maxLength={2000}
              required
            />
          </label>
          <label>
            Author
            <input
              value={commentAuthor}
              onChange={(e) => setCommentAuthor(e.target.value)}
              maxLength={100}
              placeholder="optional"
            />
          </label>
          <button type="submit">Add comment</button>
        </form>
      </div>
    </div>
  );
}
