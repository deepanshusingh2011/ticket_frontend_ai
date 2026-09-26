import { Link, Route, Routes } from 'react-router-dom';
import ListPage from './pages/ListPage.jsx';
import CreatePage from './pages/CreatePage.jsx';
import DetailPage from './pages/DetailPage.jsx';
import EditPage from './pages/EditPage.jsx';

export default function App() {
  return (
    <div className="container">
      <header>
        <h1>Support Ticket System</h1>
        <p className="meta">Backend: Spring Boot :8080 · Frontend: Vite :5174 · DB: H2 file</p>
        <nav className="row">
          <Link to="/"><button type="button" className="secondary">Tickets</button></Link>
          <Link to="/create"><button type="button">+ New ticket</button></Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<ListPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/tickets/:id" element={<DetailPage />} />
        <Route path="/tickets/:id/edit" element={<EditPage />} />
        <Route path="*" element={<ListPage />} />
      </Routes>
    </div>
  );
}
