import { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import {
  Home, Search, User, Bell, LogOut, Plus, FileText, Menu, X,
  Heart, MessageSquare, CheckCheck, Settings, Command, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import ScrollProgress from '../components/ui/ScrollProgress';
import BackToTop from '../components/ui/BackToTop';

const RootLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [seenIds, setSeenIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('notenest_seen_notifs') || '[]')); }
    catch { return new Set(); }
  });

  const { user, logout } = useAuth();
  const { notifications, unreadCount, isLoading: isLoadingNotifications, markAsRead, refreshNotifications } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const reduceMotion = useReducedMotion();
  const ambientY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 120]);

  useEffect(() => {
    const updateScroll = () => {
      setScrolled(window.scrollY > 16);
    };
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsNotifOpen(false);
    setIsProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setIsNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
    };
    const handleEscape = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        navigate('/explore');
      }
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setIsNotifOpen(false);
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const markAllAsSeen = (items = notifications) => {
    markAsRead(items);
    setSeenIds(new Set(items.map((item) => String(item.id))));
  };

  const toggleNotifications = async () => {
    const opening = !isNotifOpen;
    setIsNotifOpen(opening);
    if (opening) {
      const items = await refreshNotifications(true);
      if (items) markAllAsSeen(items);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0a0b0f] font-sans text-slate-200 selection:bg-blue-500/30">
      <ScrollProgress />
      <motion.div className="ambient-background" style={{ y: ambientY }} />

      <motion.nav
        initial={false}
        animate={{ height: scrolled ? 68 : 76 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className={`fixed left-0 top-0 z-50 w-full border-b transition-colors duration-300 ${
          scrolled ? 'glass-strong border-white/10' : 'border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Link to="/" className="group flex items-center gap-2.5 rounded-lg" aria-label="NoteNest home">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-white transition-colors group-hover:border-blue-400/40 group-hover:bg-blue-500/10">
                <FileText className="h-[18px] w-[18px]" strokeWidth={1.8} />
              </span>
              <span className="text-[17px] font-semibold tracking-[-0.03em] text-white">NoteNest</span>
            </Link>

            <div className="hidden items-center gap-1 md:flex">
              <NavButton to="/" icon={<Home />} label="Home" />
              <NavButton to="/explore" icon={<Search />} label="Explore" />
              <NavButton to="/create" icon={<Plus />} label="Upload" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => navigate('/explore')}
              aria-label="Search notes"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/[0.06] hover:text-white sm:hidden"
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            <button
              onClick={() => navigate('/explore')}
              aria-label="Search notes"
              className="hidden h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 text-xs font-medium text-slate-400 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white sm:flex"
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
              <span className="ml-3 flex items-center gap-1 rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] text-slate-500">
                <Command className="h-3 w-3" /> K
              </span>
            </button>

            <div className="relative" ref={notifRef}>
              <button
                onClick={toggleNotifications}
                aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
                aria-expanded={isNotifOpen}
                className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition ${
                  isNotifOpen ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
                }`}
              >
                <Bell className="h-[18px] w-[18px]" strokeWidth={1.8} />
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute right-1 top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-[#101218] bg-rose-500 px-1 text-[9px] font-bold text-white"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </button>
              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className="glass-strong absolute right-0 top-full mt-3 w-[min(380px,calc(100vw-24px))] overflow-hidden rounded-2xl shadow-2xl"
                  >
                    <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-4">
                      <div>
                        <h3 className="text-sm font-semibold text-white">Activity</h3>
                        <p className="mt-1 text-xs text-slate-500">
                          {isLoadingNotifications ? 'Refreshing activity…' : notifications.length ? `${notifications.length} recent interactions` : 'No activity yet'}
                        </p>
                      </div>
                      {notifications.length > 0 && (
                        <button onClick={markAllAsSeen} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-300 transition hover:bg-blue-500/10">
                          <CheckCheck className="h-3.5 w-3.5" /> Mark read
                        </button>
                      )}
                    </div>
                    <div className="max-h-[min(420px,65vh)] overflow-y-auto p-2">
                      {isLoadingNotifications && !notifications.length ? (
                        <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-slate-400">
                          <Loader2 className="h-4 w-4 animate-spin" /> Loading activity
                        </div>
                      ) : notifications.length ? notifications.map((item, index) => {
                        const isComment = item.type === 'comment';
                        const isUnseen = !seenIds.has(String(item.id));
                        const timeLabel = item.created_at ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true }) : null;
                        return (
                          <motion.div
                            key={item.id || index}
                            initial={{ opacity: 0, x: -6 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.025 }}
                            className={`flex items-start gap-3 rounded-xl px-3 py-3 transition ${isUnseen ? 'bg-blue-500/[0.06]' : ''} hover:bg-white/[0.05]`}
                          >
                            <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isComment ? 'bg-blue-500/10 text-blue-300' : 'bg-rose-500/10 text-rose-300'}`}>
                              {isComment ? <MessageSquare className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs leading-relaxed text-slate-300">
                                <span className="font-semibold text-white">@{item.sender || 'Student'}</span>
                                {isComment ? ' commented on ' : ' liked '}
                                <span className="font-medium text-white">“{item.note_title}”</span>
                              </p>
                              {item.message && <p className="mt-1 truncate text-xs text-slate-500">“{item.message}”</p>}
                              {timeLabel && <span className="mt-1.5 block text-[10px] text-slate-500">{timeLabel}</span>}
                            </div>
                            {isUnseen && <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />}
                          </motion.div>
                        );
                      }) : (
                        <div className="px-4 py-10 text-center">
                          <Bell className="mx-auto mb-3 h-5 w-5 text-slate-600" />
                          <p className="text-sm font-medium text-slate-300">You’re all caught up</p>
                          <p className="mt-1 text-xs text-slate-500">Likes and comments will show up here.</p>
                        </div>
                      )}
                    </div>
                    <Link to="/notifications" onClick={() => setIsNotifOpen(false)} className="block border-t border-white/[0.07] px-4 py-3 text-center text-xs font-medium text-slate-400 transition hover:bg-white/[0.04] hover:text-white">
                      View notification center
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative hidden md:block" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen((value) => !value)}
                aria-label="Open profile menu"
                aria-expanded={isProfileOpen}
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.07] text-sm font-semibold text-white transition hover:border-blue-400/40 hover:bg-blue-500/10"
              >
                {user?.username?.[0]?.toUpperCase() || <User className="h-4 w-4" />}
              </button>
              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    className="glass-strong absolute right-0 top-full mt-3 w-60 rounded-2xl p-2 shadow-2xl"
                  >
                    <div className="border-b border-white/[0.07] px-3 py-3">
                      <p className="truncate text-sm font-semibold text-white">{user?.username}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">{user?.email}</p>
                    </div>
                    <MenuLink to="/profile" icon={<User />} label="Profile" onClick={() => setIsProfileOpen(false)} />
                    <MenuLink to="/settings" icon={<Settings />} label="Settings" onClick={() => setIsProfileOpen(false)} />
                    <button onClick={handleLogout} className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-rose-300 transition hover:bg-rose-500/10">
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 transition hover:bg-white/[0.06] hover:text-white md:hidden"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass-strong fixed inset-x-0 top-[68px] z-40 border-x-0 border-t-0 p-4 shadow-xl md:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1">
              <NavButton to="/" icon={<Home />} label="Home" onClick={() => setIsMobileMenuOpen(false)} />
              <NavButton to="/explore" icon={<Search />} label="Explore" onClick={() => setIsMobileMenuOpen(false)} />
              <NavButton to="/create" icon={<Plus />} label="Upload notes" onClick={() => setIsMobileMenuOpen(false)} />
              <NavButton to="/profile" icon={<User />} label="Profile" onClick={() => setIsMobileMenuOpen(false)} />
              <NavButton to="/notifications" icon={<Bell />} label="Notifications" onClick={() => setIsMobileMenuOpen(false)} />
              <button onClick={handleLogout} className="mt-1 flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-rose-300 transition hover:bg-rose-500/10">
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 mx-auto min-h-[calc(100vh-180px)] w-full max-w-7xl px-4 pb-16 pt-28 sm:px-6">
        <Outlet />
      </main>

      <Footer />
      <BackToTop />
    </div>
  );
};

const NavButton = ({ to, icon, label, onClick }) => (
  <NavLink
    to={to}
    end={to === '/'}
    onClick={onClick}
    className={({ isActive }) => `relative flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
      isActive ? 'bg-white/[0.08] text-white' : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
    }`}
  >
    {({ isActive }) => (
      <>
        {isActive && <motion.span layoutId="active-nav" className="absolute inset-0 rounded-xl border border-white/[0.08] bg-white/[0.04]" />}
        <span className="relative flex items-center gap-2">{icon && <span className="[&>svg]:h-4 [&>svg]:w-4">{icon}</span>}{label}</span>
      </>
    )}
  </NavLink>
);

const MenuLink = ({ to, icon, label, onClick }) => (
  <Link to={to} onClick={onClick} className="mt-1 flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white">
    {icon} {label}
  </Link>
);

const Footer = () => (
  <footer className="relative z-10 border-t border-white/[0.07] bg-white/[0.015]">
    <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-4">
      <div className="col-span-2 lg:col-span-1">
        <Link to="/" className="inline-flex items-center gap-2.5 text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06]"><FileText className="h-4 w-4" /></span>
          <span className="font-semibold tracking-tight">NoteNest</span>
        </Link>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">A thoughtful space to share what you learn.</p>
        <div className="mt-4 flex gap-2" aria-label="Social links">
          {/* TODO: Add official social profile links when available. */}
          <span className="rounded-lg border border-white/[0.07] px-2.5 py-1 text-xs text-slate-500">Community</span>
        </div>
      </div>
      <FooterColumn title="Product" links={[['Home', '/'], ['Explore', '/explore'], ['Upload notes', '/create']]} />
      <FooterColumn title="Account" links={[['Profile', '/profile'], ['Notifications', '/notifications'], ['Settings', '/settings']]} />
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Legal</h2>
        <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500">
          {/* TODO: Link these labels when legal pages are available. */}
          <span>Privacy</span>
          <span>Terms</span>
        </div>
      </div>
    </div>
    <div className="border-t border-white/[0.06]">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <span>© {new Date().getFullYear()} NoteNest</span>
        <span>Made for students</span>
      </div>
    </div>
  </footer>
);

const FooterColumn = ({ title, links }) => (
  <div>
    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">{title}</h2>
    <div className="mt-4 flex flex-col gap-3">
      {links.map(([label, path]) => (
        <Link key={path} to={path} className="w-fit text-sm text-slate-500 transition hover:text-white">{label}</Link>
      ))}
    </div>
  </div>
);

export default RootLayout;
