import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

// Helper: get the set of "seen" notification IDs from localStorage
const getSeenIds = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem('notenest_seen_notifs') || '[]'));
  } catch {
    return new Set();
  }
};

const saveSeenIds = (ids) => {
  try {
    localStorage.setItem('notenest_seen_notifs', JSON.stringify([...ids]));
  } catch {}
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const notificationsRef = useRef(notifications);
  const pendingRequestRef = useRef(null);
  notificationsRef.current = notifications;

  const computeUnread = (items, seenIds) => {
    return items.filter(n => !seenIds.has(String(n.id))).length;
  };

  const fetchNotifications = useCallback(async (includeComments = false) => {
    if (!user) return null;
    if (pendingRequestRef.current) {
      await pendingRequestRef.current;
      if (!includeComments) return notificationsRef.current;
    }

    setIsLoading(true);
    const request = (async () => {
    try {
      const notifPromise = api.get('notes/notification/');
      const notesPromise = includeComments ? api.get('notes/all/') : Promise.resolve(null);
      const [notifResponse, notesResponse] = await Promise.all([notifPromise, notesPromise]);
      const rawData = notifResponse.data;
      const likesData = Array.isArray(rawData) ? rawData : [];

      const normalizedLikes = likesData.map(item => ({
        ...item,
        type: 'like',
        timestamp: item.created_at ? new Date(item.created_at) : new Date(0),
      }));

      let normalizedComments = notificationsRef.current.filter(item => item.type === 'comment');
      if (includeComments) {
        const myNotes = Array.isArray(notesResponse.data) ? notesResponse.data : [];
        const commentsByNote = [];
        for (let start = 0; start < myNotes.length; start += 5) {
          const batch = myNotes.slice(start, start + 5);
          const batchResults = await Promise.all(batch.map(note =>
              api.get(`notes/comment/${note.id}/`).then(res => ({
                noteTitle: note.title,
                comments: Array.isArray(res.data) ? res.data : [],
              })).catch(error => {
                console.error(`Failed to load comments for note ${note.id}:`, error);
                return { noteTitle: note.title, comments: [] };
              })
            ));
          commentsByNote.push(...batchResults);
        }
        normalizedComments = commentsByNote.flatMap(result =>
          result.comments
            .filter(comment => comment.sender !== user.username)
            .map(comment => ({
              id: `comment-${comment.id}`,
              sender: comment.sender || 'Student',
              note_title: result.noteTitle,
              type: 'comment',
              message: comment.comment,
              created_at: null,
              timestamp: new Date(0),
            }))
        );
      }

      const combined = [...normalizedLikes, ...normalizedComments].sort(
        (a, b) => b.timestamp - a.timestamp
      );

      const seenIds = getSeenIds();
      notificationsRef.current = combined;
      setNotifications(combined);
      setUnreadCount(computeUnread(combined, seenIds));
      return combined;
    } catch (error) {
      console.error('Notification aggregation failed:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
    })();

    pendingRequestRef.current = request;
    try {
      return await request;
    } finally {
      pendingRequestRef.current = null;
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications(false);
      const interval = setInterval(() => fetchNotifications(false), 60000);
      return () => clearInterval(interval);
    } else {
      notificationsRef.current = [];
      setNotifications([]);
      setUnreadCount(0);
      setIsLoading(false);
    }
  }, [user, fetchNotifications]);

  const markAsRead = (items = notifications) => {
    // Save all current notification IDs as "seen" in localStorage
    const allIds = new Set(items.map(n => String(n.id)));
    saveSeenIds(allIds);
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, isLoading, markAsRead, refreshNotifications: fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
