import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, PRIORITIES } from '../api.js';
import { ErrorBanner } from './ListPage.jsx';

export default function EditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [edit, setEdit] = useState({ title: '', description: '', priority: 'MEDIUM', assignee: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const data = await api.get(id);
        if (!cancelled) {
          setEdit({
            title: data.title ?? '',
            description: data.description ?? '',
            priority: data.priority ?? 'MEDIUM',
            assignee: data.assignee || ''
          });
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.update(id, {
        title: edit.title,
        description: edit.description,
        priority: edit.priority,
        assignee: edit.assignee
      });
      navigate(`/tickets/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Delete ticket #${id}? This cannot be undone.`)) return;
    try {
      await api.remove(id);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div className="card"><p>Loading…</p></div>;

  return (
    <div>
      <ErrorBanner message={error} onClose={() => setError('')} />
      <form className="card" onSubmit={save}>
        <Link to={`/tickets/${id}`}>← Back to ticket</Link>
        <h2>Edit ticket #{id}</h2>
        <label>
          Title
          <input
            value={edit.title}
            onChange={(e) => setEdit({ ...edit, title: e.target.value })}
            maxLength={200}
          />
        </label>
        <label>
          Description
          <textarea
            value={edit.description}
            onChange={(e) => setEdit({ ...edit, description: e.target.value })}
            maxLength={4000}
          />
        </label>
        <div className="row">
          <label>
            Priority
            <select
              value={edit.priority}
              onChange={(e) => setEdit({ ...edit, priority: e.target.value })}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
          <label>
            Assignee
            <input
              value={edit.assignee}
              onChange={(e) => setEdit({ ...edit, assignee: e.target.value })}
              maxLength={100}
            />
          </label>
        </div>
        <div className="row">
          <button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
          <button type="button" className="secondary" onClick={remove}>Delete</button>
        </div>
      </form>
    </div>
  );
}
