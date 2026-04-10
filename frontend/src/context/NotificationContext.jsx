import { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  const { user } = useAuth();

  const computeUnread = (items, seenIds) => {
    return items.filter(n => !seenIds.has(String(n.id))).length;
  };

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      // 1. Fetch Likes (Notifications from backend)
      const notifResponse = await api.get('notes/notification/');
      const rawData = notifResponse.data;
      const likesData = Array.isArray(rawData) ? rawData : [];

      // 2. Normalize Likes — backend notification IDs are stable
      const normalizedLikes = likesData.map(item => ({
        ...item,
        type: 'like',
        timestamp: item.created_at ? new Date(item.created_at) : new Date(0),
      }));

      // 3. Fetch User's Notes to look for comments
      const notesResponse = await api.get('notes/all/');
      const myNotes = Array.isArray(notesResponse.data) ? notesResponse.data : [];

      // 4. Fetch Comments for each note in parallel
      const commentRequests = myNotes.map(note =>
        api.get(`notes/comment/${note.id}/`).then(res => ({
          noteId: note.id,
          noteTitle: note.title,
          comments: Array.isArray(res.data) ? res.data : []
        })).catch(() => ({ noteId: note.id, noteTitle: note.title, comments: [] }))
      );

      const allCommentsResults = await Promise.all(commentRequests);

      // 5. Flatten and Normalize Comments — only from other users
      const normalizedComments = [];
      allCommentsResults.forEach(result => {
        result.comments.forEach(comment => {
          if (comment.sender !== user.username) {
            normalizedComments.push({
              // Use stable ID so localStorage seen tracking works
              id: `comment-${comment.id}`,
              sender: comment.sender || 'Student',
              note_title: result.noteTitle,
              type: 'comment',
              message: comment.comment,
              // Comments have no created_at from the backend, use epoch 0
              created_at: null,
              timestamp: new Date(0),
            });
          }
        });
      });

      // 6. Merge and sort — likes have real timestamps, comments appear after
      const combined = [...normalizedLikes, ...normalizedComments].sort(
        (a, b) => b.timestamp - a.timestamp
      );

      const seenIds = getSeenIds();
      setNotifications(combined);
      setUnreadCount(computeUnread(combined, seenIds));
    } catch (error) {
      console.error('Notification aggregation failed:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, fetchNotifications]);

  const markAsRead = () => {
    // Save all current notification IDs as "seen" in localStorage
    const allIds = new Set(notifications.map(n => String(n.id)));
    saveSeenIds(allIds);
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, refreshNotifications: fetchNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
