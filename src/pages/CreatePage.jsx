import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, PRIORITIES } from '../api.js';
import { ErrorBanner } from './ListPage.jsx';

export default function CreatePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [assignee, setAssignee] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const created = await api.create({
        title,
        description,
        priority,
        assignee: assignee || null
      });
      navigate(`/tickets/${created.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <ErrorBanner message={error} onClose={() => setError('')} />
      <form className="card" onSubmit={submit}>
        <Link to="/" className="link">← Back to list</Link>
        <h2>Create ticket</h2>
        <label>
          Title*
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} required />
        </label>
        <label>
          Description*
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={4000}
            required
          />
        </label>
        <div className="row">
          <label>
            Priority
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
          <label>
            Assignee
            <input
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              placeholder="e.g. ada"
              maxLength={100}
            />
          </label>
        </div>
        <button type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create'}</button>
      </form>
    </div>
  );
}
