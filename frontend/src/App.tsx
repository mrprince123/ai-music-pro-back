import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Home, Music, LayoutDashboard, Settings, LogOut, Loader2, Upload, Menu, X, BarChart3, Tags, PlayCircle, AlertTriangle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useState, useEffect } from 'react';
import axios from 'axios';

// Configure Axios Defaults
axios.defaults.baseURL = 'http://localhost:5002';

const ProtectedRoute = ({ children }: { children: any }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await axios.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="glassmorphism p-8 rounded-2xl w-full max-w-md border border-slate-700">
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-3xl overflow-hidden flex items-center justify-center mx-auto mb-4 border border-indigo-500/30 shadow-lg shadow-indigo-500/20">
            <img src="/logo.png" alt="AI Music Pro Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-widest uppercase">AI Music Pro</h1>
          <p className="text-slate-400 mt-2 text-sm">Secure Management Console</p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-sm mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-1 block">Email Address</label>
            <input 
              type="email" 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-300 mb-1 block">Password</label>
            <input 
              type="password" 
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="mt-4 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminLayout({ children }: { children: any }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const navLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`;
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans flex flex-col md:flex-row">
      {/* Mobile Topbar */}
      <div className="md:hidden glassmorphism flex justify-between items-center p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">AI Music Pro</h1>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-300">
            {mobileMenuOpen ? <X size={28}/> : <Menu size={28}/>}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`${mobileMenuOpen ? 'flex' : 'hidden'} md:flex w-full md:w-64 glassmorphism border-r border-slate-700/50 p-6 flex-col justify-between absolute md:relative z-40 min-h-screen md:min-h-full`}>
        <div>
          <div className="hidden md:flex items-center gap-3 mb-10 px-2">
            <div className="bg-indigo-500/10 p-1.5 rounded-xl border border-white/5 shadow-inner">
              <img src="/logo.png" alt="AI Music Pro" className="w-10 h-10 rounded-lg shadow-2xl" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black bg-gradient-to-r from-white via-indigo-200 to-slate-400 bg-clip-text text-transparent tracking-tighter">
                AI MUSIC PRO
              </h1>
              <span className="text-[10px] text-indigo-400 font-bold tracking-widest -mt-1 uppercase">Cloud Admin</span>
            </div>
          </div>
          <nav className="flex flex-col gap-2 relative">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className={navLinkClass('/')}>
              <LayoutDashboard size={20} /> Library
            </Link>
            <Link to="/categories" onClick={() => setMobileMenuOpen(false)} className={navLinkClass('/categories')}>
              <Tags size={20} /> Categories
            </Link>
            <Link to="/upload" onClick={() => setMobileMenuOpen(false)} className={navLinkClass('/upload')}>
              <Upload size={20} /> Publish Track
            </Link>
            <Link to="/analytics" onClick={() => setMobileMenuOpen(false)} className={navLinkClass('/analytics')}>
              <BarChart3 size={20} /> Analytics
            </Link>
          </nav>
        </div>
        
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 hover:bg-rose-500/10 hover:text-rose-400 rounded-xl transition-all text-slate-400 mt-auto">
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full">
        {children}
      </main>
    </div>
  );
}

function Dashboard() {
  const [songs, setSongs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSong, setEditingSong] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [songsRes, catRes] = await Promise.all([
          axios.get('/songs'),
          axios.get('/categories')
      ]);
      setSongs(songsRes.data.songs);
      setCategories(catRes.data.data);
    } catch (err) {
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await axios.delete(`/songs/${deleteId}`);
      toast.success("Track successfully deleted.");
      setDeleteId(null);
      fetchData();
    } catch(err) {
      toast.error("Failed to delete track");
      setDeleteId(null);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!editingSong) return;
    const formData = new FormData(e.currentTarget);
    const loadingToast = toast.loading("Saving changes...");
    try {
      await axios.put(`/songs/${editingSong._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setEditingSong(null);
      toast.success("Track metadata updated successfully!", { id: loadingToast });
      fetchData();
    } catch(err) {
      toast.error("Failed to apply update.", { id: loadingToast });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white">Songs Library</h2>
          <p className="text-slate-400 mt-1">Manage all production audio tracks</p>
        </div>
        <Link to="/upload" className="bg-indigo-500 hover:bg-indigo-600 px-6 py-2.5 rounded-full font-medium transition-colors shadow-lg shadow-indigo-500/25 flex items-center gap-2">
          <Upload size={18} /> New Release
        </Link>
      </header>

      {/* Table */}
      <div className="glassmorphism rounded-2xl border border-slate-700/50 shadow-2xl overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="animate-spin text-indigo-500" size={40} />
          </div>
        ) : (
          <table className="w-full text-left min-w-max">
            <thead className="bg-[#1e293b]/50 border-b border-slate-700/50">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-300 text-sm tracking-wide">Track Information</th>
                <th className="px-6 py-4 font-semibold text-slate-300 text-sm tracking-wide">Artist</th>
                <th className="px-6 py-4 font-semibold text-slate-300 text-sm tracking-wide">Genre</th>
                <th className="px-6 py-4 font-semibold text-slate-300 text-sm tracking-wide">Audio Stream</th>
                <th className="px-6 py-4 text-right font-semibold text-slate-300 text-sm tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {songs.map((song: any) => (
                <tr key={song._id} className="hover:bg-slate-800/40 transition-colors group">
                  <td className="px-6 py-4 flex items-center gap-4">
                    <img src={song.thumbnailUrl} alt={song.songName} className="w-14 h-14 rounded-lg object-cover shadow-md" />
                    <div>
                      <p className="font-semibold text-white text-base">{song.songName}</p>
                      <p className="text-sm text-slate-400 truncate w-48">{song.description || 'No description provided'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300 font-medium">{song.singerName}</td>
                  <td className="px-6 py-4 text-slate-300">
                    <span className="px-3 py-1 bg-slate-700/50 rounded-full text-xs font-semibold">{song.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <audio controls src={song.songUrl} className="h-10 w-48 scale-90 origin-left" controlsList="nodownload" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingSong(song)} className="text-indigo-400 hover:text-indigo-300 font-medium px-4 py-2 hover:bg-indigo-500/10 rounded-lg transition-colors text-sm">
                          Edit
                        </button>
                        <button onClick={() => setDeleteId(song._id)} className="text-rose-400 hover:text-rose-300 font-medium px-4 py-2 hover:bg-rose-500/10 rounded-lg transition-colors text-sm">
                          Delete
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {!loading && songs.length === 0 && (
          <div className="p-16 flex flex-col items-center justify-center text-slate-500 space-y-4">
            <Music size={48} className="opacity-20" />
            <p>No songs found in the library.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative text-center transform transition-all">
             <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4 scale-110">
                <AlertTriangle className="text-rose-500" size={32} />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">Confirm Deletion</h3>
             <p className="text-slate-400 text-sm mb-6">Are you completely sure you want to delete this track? This action permanently wipes the file from Cloudinary and the API Server.</p>
             <div className="flex gap-4">
                <button onClick={() => setDeleteId(null)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors">Cancel</button>
                <button onClick={confirmDelete} className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-rose-500/25">Delete Track</button>
             </div>
          </div>
        </div>
      )}

      {/* Edit Modal Popup */}
      {editingSong && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-2xl font-bold text-white mb-6">Update Track</h3>
            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Song Name</label>
                <input name="songName" defaultValue={editingSong.songName} className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Artist</label>
                  <input name="singerName" defaultValue={editingSong.singerName} className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none" required />
                </div>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="text-sm text-slate-400 mb-1 block">Category</label>
                    <select name="category" defaultValue={editingSong.category} className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none appearance-none" required>
                      {categories.map((c: any) => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Description</label>
                <textarea name="description" defaultValue={editingSong.description} className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none h-20 resize-none" />
              </div>

              {/* Media Preview Section */}
              <div className="flex gap-4 p-4 border border-slate-700/50 rounded-xl bg-slate-800/30">
                <img src={editingSong.thumbnailUrl} className="w-20 h-20 rounded-lg object-cover shadow-md" alt="Current" />
                <div className="flex-1 flex flex-col items-center justify-center">
                    <p className="text-xs text-slate-400 mb-1">Current Audio Stream</p>
                    <audio controls src={editingSong.songUrl} className="w-full h-8 scale-90" controlsList="nodownload"></audio>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 font-medium mb-1 block">Overwrite Audio File</label>
                  <input name="song" type="file" accept="audio/*" className="w-full text-xs text-slate-400 file:bg-slate-700 file:text-white file:border-0 file:px-3 file:py-1 file:rounded-full file:text-xs hover:file:bg-slate-600 transition-colors" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 font-medium mb-1 block">Overwrite Thumbnail</label>
                  <input name="thumbnail" type="file" accept="image/*" className="w-full text-xs text-slate-400 file:bg-slate-700 file:text-white file:border-0 file:px-3 file:py-1 file:rounded-full file:text-xs hover:file:bg-slate-600 transition-colors" />
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setEditingSong(null)} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors">Cancel</button>
                <button type="submit" className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


function UploadPage() {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();
    
    useEffect(() => {
        axios.get('/categories').then(res => setCategories(res.data.data)).catch(console.error);
    }, []);
    
    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        const loadingToast = toast.loading("Uploading Media to Cloudinary...");
        
        try {
            await axios.post('/songs/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Track Uploaded Successfully!', { id: loadingToast });
            navigate('/');
        } catch(err) {
            toast.error("Upload failed. Ensure accurate parameters.", { id: loadingToast });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-white">Publish Release</h2>
                <p className="text-slate-400 mt-1">Upload tracks directly to Cloudinary and Sync with MongoDB</p>
            </header>

            <form onSubmit={handleUpload} className="glassmorphism p-8 rounded-2xl border border-slate-700 flex flex-col gap-6 shadow-xl">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">Track Name</label>
                        <input name="songName" required type="text" className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500" placeholder="e.g. Starboy"/>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">Artist Name</label>
                        <input name="singerName" required type="text" className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500" placeholder="e.g. The Weeknd"/>
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Category / Genre</label>
                    <select name="category" required className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 appearance-none">
                        <option value="">Select a Category...</option>
                        {categories.map((c: any) => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>
                </div>

                <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Description (Optional)</label>
                    <textarea name="description" className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500 resize-none h-24" placeholder="Write a short description about this track..."/>
                </div>

                <div className="grid grid-cols-2 gap-6 p-6 bg-slate-800/30 rounded-xl border border-slate-700/50 border-dashed">
                    <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">Audio File (MP3)</label>
                        <input name="song" required type="file" accept="audio/*" className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 cursor-pointer"/>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-300 mb-2 block">Thumbnail Image</label>
                        <input name="thumbnail" required type="file" accept="image/*" className="text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 cursor-pointer"/>
                    </div>
                </div>

                <button disabled={loading} type="submit" className="mt-4 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <><Upload size={18} /> Upload to Server</>}
                </button>
            </form>
        </div>
    )
}

function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const fetchCat = async () => {
        try {
            const res = await axios.get('/categories');
            setCategories(res.data.data);
        } catch(err) { console.error(err); }
    };

    const handleCreate = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        const loadingToast = toast.loading("Spinning up Category...");
        try {
            await axios.post('/categories', { name, description: desc });
            setName(''); setDesc(''); fetchCat();
            toast.success(`Category '${name}' Added!`, { id: loadingToast });
        } catch(err: any) { 
            toast.error(err.response?.data?.message || 'Error creating category', { id: loadingToast }); 
        } finally { setLoading(false); }
    };

    const confirmCatDelete = async () => {
        if(!deleteId) return;
        try {
            await axios.delete(`/categories/${deleteId}`);
            fetchCat();
            toast.success("Category deleted safely.");
            setDeleteId(null);
        } catch(err: any) { 
            toast.error(err.response?.data?.message || 'Conflict occurred'); 
            setDeleteId(null);
        }
    }

    useEffect(() => { fetchCat() }, []);

    return (
        <div className="max-w-4xl mx-auto">
            <header className="mb-8">
                <h2 className="text-3xl font-bold text-white">Genre Categories</h2>
                <p className="text-slate-400 mt-1">Manage standard music tags across the application</p>
            </header>

            <form onSubmit={handleCreate} className="glassmorphism p-6 rounded-2xl border border-slate-700 flex gap-4 items-end shadow-xl mb-8">
                <div className="flex-1">
                    <label className="text-sm font-medium text-slate-300 mb-2 block">New Category Name</label>
                    <input value={name} onChange={(e)=>setName(e.target.value)} required type="text" className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500" placeholder="e.g. Synthwave"/>
                </div>
                <div className="flex-1">
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Description</label>
                    <input value={desc} onChange={(e)=>setDesc(e.target.value)} type="text" className="w-full bg-[#1e293b] border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500" placeholder="Optional..."/>
                </div>
                <button disabled={loading} type="submit" className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium px-8 py-3 rounded-xl shadow-lg transition-all h-[50px]">
                    Add Header
                </button>
            </form>

            <div className="glassmorphism rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-[#1e293b]/50 border-b border-slate-700/50">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-300">Name</th>
                            <th className="px-6 py-4 font-semibold text-slate-300">Description</th>
                            <th className="px-6 py-4 text-right font-semibold text-slate-300">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {categories.map((c: any) => (
                            <tr key={c._id} className="hover:bg-slate-800/40">
                                <td className="px-6 py-4 font-semibold text-white">{c.name}</td>
                                <td className="px-6 py-4 text-slate-400 text-sm">{c.description || '--'}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={()=>setDeleteId(c._id)} className="text-rose-400 hover:bg-rose-500/10 px-4 py-2 rounded-lg font-medium text-sm transition-colors">Delete</button>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-slate-500">No categories mapped.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Category Delete Confirm Modal */}
            {deleteId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl relative text-center">
                    <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="text-rose-500" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Delete Tag?</h3>
                    <p className="text-slate-400 text-sm mb-6">Are you sure you want to remove this category? If any tracks are using this category, the API will refuse the deletion.</p>
                    <div className="flex gap-4">
                        <button onClick={() => setDeleteId(null)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors">Cancel</button>
                        <button onClick={confirmCatDelete} className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium transition-colors">Delete Tag</button>
                    </div>
                </div>
                </div>
            )}
        </div>
    )
}

function AnalyticsPage() {
    const [data, setData] = useState<any>(null);
    useEffect(() => {
        axios.get('/analytics').then(res => setData(res.data.data)).catch(console.error);
    }, []);

    if(!data) return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-indigo-500" size={40}/></div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <header>
                <h2 className="text-3xl font-bold text-white">System Analytics</h2>
                <p className="text-slate-400 mt-1">Live metrics from your MongoDB cluster</p>
            </header>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="glassmorphism p-6 rounded-2xl border border-slate-700 shadow-xl border-t-indigo-500 border-t-4">
                    <p className="text-slate-400 font-medium text-sm">Total Streams</p>
                    <p className="text-4xl font-bold text-white mt-2">{data.metrics.totalPlays}</p>
                </div>
                <div className="glassmorphism p-6 rounded-2xl border border-slate-700 shadow-xl border-t-emerald-500 border-t-4">
                    <p className="text-slate-400 font-medium text-sm">Active Songs</p>
                    <p className="text-4xl font-bold text-white mt-2">{data.metrics.totalSongs}</p>
                </div>
                <div className="glassmorphism p-6 rounded-2xl border border-slate-700 shadow-xl border-t-fuchsia-500 border-t-4">
                    <p className="text-slate-400 font-medium text-sm">User Albums</p>
                    <p className="text-4xl font-bold text-white mt-2">{data.metrics.totalAlbums}</p>
                </div>
                <div className="glassmorphism p-6 rounded-2xl border border-slate-700 shadow-xl border-t-orange-500 border-t-4">
                    <p className="text-slate-400 font-medium text-sm">Registered Accounts</p>
                    <p className="text-4xl font-bold text-white mt-2">{data.metrics.totalUsers}</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="glassmorphism p-6 rounded-2xl border border-slate-700 shadow-xl">
                    <h3 className="text-lg font-bold text-white mb-4">Top Genres</h3>
                    <div className="space-y-4">
                        {data.categoryDistribution.map((c: any) => (
                            <div key={c.category} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                <span className="font-medium text-slate-300">{c.category || 'Unknown'}</span>
                                <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-sm font-bold">{c.count} Tracks</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function App() {
  // Try booting local session
  const storedToken = localStorage.getItem('token');
  if (storedToken) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
  }

  return (
    <Router>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid #334155',
          },
          success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } }
        }} 
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/upload" element={
          <ProtectedRoute>
            <AdminLayout>
              <UploadPage />
            </AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/categories" element={
          <ProtectedRoute>
            <AdminLayout>
              <CategoriesPage />
            </AdminLayout>
          </ProtectedRoute>
        } />

        <Route path="/analytics" element={
          <ProtectedRoute>
            <AdminLayout>
              <AnalyticsPage />
            </AdminLayout>
          </ProtectedRoute>
        } />

      </Routes>
    </Router>
  );
}

export default App;
