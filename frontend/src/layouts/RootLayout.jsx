import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Search, User, Bell, LogOut, Plus, FileText, Menu, X, Heart, MessageSquare, CheckCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const RootLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [seenIds, setSeenIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('notenest_seen_notifs') || '[]')); }
    catch { return new Set(); }
  });
  
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsNotifOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const toggleNotifications = () => {
    const opening = !isNotifOpen;
    setIsNotifOpen(opening);
    if (opening && unreadCount > 0) {
      // Mark all as seen when opening
      markAsRead();
      const allIds = new Set(notifications.map(n => String(n.id)));
      setSeenIds(allIds);
    }
  };

  return (
    <div className="min-h-screen bg-[#060c1c] text-slate-200 overflow-x-hidden font-sans selection:bg-violet-500/30">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Top Navigation */}
      <nav className="fixed top-0 left-0 w-full h-20 bg-[#0a1128]/80 backdrop-blur-xl border-b border-white/5 z-50 transition-all">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 h-full flex items-center justify-between">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-8">
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="bg-gradient-to-tr from-indigo-500 to-fuchsia-500 p-2 rounded-xl shadow-lg shadow-indigo-500/20 group-hover:rotate-12 transition-all">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">NoteNest</span>
            </NavLink>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
              <NavButton to="/" icon={<Home className="w-4 h-4"/>} label="Home" />
              <NavButton to="/explore" icon={<Search className="w-4 h-4"/>} label="Explore" />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            
            <button 
              onClick={() => navigate('/create')}
              className="hidden md:flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)] active:scale-95"
            >
              <Plus className="w-4 h-4" /> Upload Note
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={toggleNotifications}
                className={`p-3 rounded-xl transition-all relative ${isNotifOpen ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 bg-rose-500 rounded-full border-2 border-[#0a1128] text-[10px] font-black text-white flex items-center justify-center"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute top-full right-0 mt-4 w-[360px] lg:w-[400px] bg-[#0f172a]/98 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
                  >
                    {/* Header */}
                    <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                      <div>
                        <h3 className="font-black text-white text-base">Activity</h3>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {notifications.length > 0 ? `${notifications.length} interaction${notifications.length > 1 ? 's' : ''}` : 'No activity yet'}
                        </p>
                      </div>
                      {notifications.length > 0 && (
                        <button 
                          onClick={() => { markAsRead(); setSeenIds(new Set(notifications.map(n => String(n.id)))); }}
                          className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 bg-indigo-500/10 px-3 py-1.5 rounded-lg transition-all"
                        >
                          <CheckCheck className="w-3 h-3" /> Mark all read
                        </button>
                      )}
                    </div>

                    {/* Feed */}
                    <div className="max-h-[420px] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                      {notifications.length > 0 ? (
                        <div className="p-2 space-y-0.5">
                          {notifications.map((item, idx) => {
                            const isComment = item.type === 'comment';
                            const isUnseen = !seenIds.has(String(item.id));
                            const timeLabel = item.created_at 
                              ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true })
                              : null;

                            return (
                              <motion.div 
                                key={item.id || idx}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                className={`flex items-start gap-3 px-3 py-3 rounded-2xl transition-all cursor-pointer group relative ${isUnseen ? 'bg-indigo-500/5 hover:bg-indigo-500/10' : 'hover:bg-white/5'}`}
                              >
                                {/* Unseen blue dot */}
                                {isUnseen && (
                                  <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                                )}

                                {/* Avatar with icon overlay */}
                                <div className="relative shrink-0">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 flex items-center justify-center text-sm font-black text-white">
                                    {(item.sender || 'S')[0].toUpperCase()}
                                  </div>
                                  {/* Action type icon badge */}
                                  <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2 border-[#0f172a] flex items-center justify-center ${isComment ? 'bg-indigo-500' : 'bg-rose-500'}`}>
                                    {isComment 
                                      ? <MessageSquare className="w-2.5 h-2.5 text-white" />
                                      : <Heart className="w-2.5 h-2.5 text-white fill-white" />
                                    }
                                  </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 ml-1">
                                  <p className="text-sm text-slate-300 leading-snug">
                                    <span className="text-white font-bold">@{item.sender || 'Student'}</span>
                                    {' '}
                                    {isComment ? (
                                      <>
                                        commented on{' '}
                                        <span className="font-semibold text-white">"{item.note_title}"</span>
                                        {item.message && (
                                          <span className="block text-xs text-slate-500 mt-0.5 italic truncate">"{item.message}"</span>
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        liked your note{' '}
                                        <span className="font-semibold text-white">"{item.note_title}"</span>
                                      </>
                                    )}
                                  </p>
                                  {timeLabel && (
                                    <span className="text-[11px] text-slate-500 font-medium mt-1 block">
                                      {timeLabel}
                                    </span>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="py-14 text-center">
                          <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="w-6 h-6 text-slate-600" />
                          </div>
                          <p className="font-bold text-slate-400 text-sm">All quiet here.</p>
                          <p className="text-xs text-slate-600 mt-1">Likes and comments will appear here.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Menu */}
            <div className="relative hidden md:block" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-11 h-11 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-white/10 flex items-center justify-center text-white font-bold hover:border-indigo-500/50 transition-all overflow-hidden"
              >
                 {user?.username?.[0]?.toUpperCase() || <User className="w-5 h-5"/>}
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full right-0 mt-4 w-64 bg-[#0f172a]/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl p-2"
                  >
                    <div className="p-4 border-b border-white/5 mb-2">
                       <p className="font-black text-white truncate">{user?.username}</p>
                       <p className="text-xs font-semibold text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <NavLink to="/profile" className="flex items-center gap-3 p-3 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                      <User className="w-4 h-4" /> Profile Details
                    </NavLink>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 text-sm font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Toggle */}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-3 text-white">
               {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden fixed top-20 left-0 w-full bg-[#0a1128]/95 backdrop-blur-2xl border-b border-white/5 z-40"
          >
            <div className="p-6 flex flex-col gap-2">
              <NavButton to="/" icon={<Home className="w-5 h-5"/>} label="Home" />
              <NavButton to="/explore" icon={<Search className="w-5 h-5"/>} label="Explore" />
              <NavButton to="/profile" icon={<User className="w-5 h-5"/>} label="Profile" />
              <button 
                onClick={() => { setIsMobileMenuOpen(false); navigate('/create'); }}
                className="flex items-center gap-3 px-4 py-3 bg-indigo-500/20 text-indigo-300 rounded-xl font-bold mt-2 border border-indigo-500/20"
              >
                <Plus className="w-5 h-5" /> Upload Note
              </button>
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-rose-400 font-bold mt-2 border border-rose-500/10 rounded-xl">
                <LogOut className="w-5 h-5" /> Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="relative z-10 pt-28 pb-20 px-6 lg:px-12 max-w-[1600px] mx-auto min-h-screen">
        <Outlet />
      </main>

    </div>
  );
};

const NavButton = ({ to, icon, label }) => (
  <NavLink 
    to={to}
    className={({ isActive }) => 
      `flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
        isActive ? 'bg-white/10 text-white shadow-inner border border-white/5' : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`
    }
  >
    {icon} {label}
  </NavLink>
);

export default RootLayout;
