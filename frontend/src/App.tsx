import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home, Music, LayoutDashboard, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    // Fetch songs on mount
    axios.get('http://localhost:5002/songs').then(res => setSongs(res.data.songs));
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 glassmorphism border-r border-slate-700 p-6 flex flex-col gap-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          AdminPanel
        </h1>
        <nav className="flex flex-col gap-2 mt-4">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 bg-indigo-500/10 text-indigo-400 rounded-xl transition-all font-medium">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/upload" className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 rounded-xl transition-all text-slate-400 hover:text-white">
            <Music size={20} /> Upload Track
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Songs Library</h2>
            <p className="text-slate-400 mt-1">Manage your massive audio collection</p>
          </div>
          <button className="bg-indigo-500 hover:bg-indigo-600 px-6 py-2.5 rounded-full font-medium transition-colors shadow-lg shadow-indigo-500/25">
            + New Release
          </button>
        </header>

        {/* Table */}
        <div className="glassmorphism rounded-2xl overflow-hidden border border-slate-700/50">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-slate-700/50">
              <tr>
                <th className="px-6 py-4 font-medium text-slate-300">Track</th>
                <th className="px-6 py-4 font-medium text-slate-300">Artist</th>
                <th className="px-6 py-4 font-medium text-slate-300">Category</th>
                <th className="px-6 py-4 font-medium text-slate-300">Plays</th>
                <th className="px-6 py-4 font-medium text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {songs.map((song: any) => (
                <tr key={song._id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 flex items-center gap-4">
                    <img src={song.thumbnailUrl} alt={song.songName} className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <p className="font-semibold text-white">{song.songName}</p>
                      <p className="text-sm text-slate-400 truncate w-48">{song.description}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{song.singerName}</td>
                  <td className="px-6 py-4 text-slate-300">
                    <span className="px-3 py-1 bg-white/10 rounded-full text-xs">{song.category}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-300 text-sm">{song.playCount || 0}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-indigo-400 hover:text-indigo-300 font-medium px-3">Edit</button>
                    <button className="text-rose-400 hover:text-rose-300 font-medium px-3">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {songs.length === 0 && (
            <div className="p-12 text-center text-slate-500">No songs currently uploaded.</div>
          )}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
