import api from '../api/axios';

// IMPORTANT: axios baseURL is '/api' (relative, no trailing slash).
// With a RELATIVE baseURL:
//   - Paths WITHOUT a leading slash → correctly appended: '/api' + 'notes/1/' = '/api/notes/1/' ✅
//   - Paths WITH a leading slash   → treated as absolute, baseURL IGNORED: '/notes/1/' → '/notes/1/' ❌
// All paths below are intentionally written WITHOUT a leading slash.

const noteService = {
  // NOTES CRUD
  getAllNotes: async () => {
    const response = await api.get('notes/all/');
    return response.data;
  },

  getExploreNotes: async (params = {}) => {
    const response = await api.get('notes/explore/', { params });
    return response.data;
  },

  getNoteById: async (id) => {
    const response = await api.get(`notes/${id}/`);
    return response.data;
  },

  createNote: async (formData) => {
    // POST to notes/0/ — the id=0 is received by the view but intentionally ignored during creation.
    // Do NOT pass { headers: { 'Content-Type': 'multipart/form-data' } } here.
    // Axios auto-sets the correct boundary when FormData is detected.
    return await api.post('notes/0/', formData);
  },

  updateNote: async (id, formData) => {
    return await api.put(`notes/${id}/`, formData);
  },

  deleteNote: async (id) => {
    return await api.delete(`notes/${id}/`);
  },

  // SOCIAL
  likeNote: async (id) => {
    // Backend URL has a LITERAL space: 'api/notes/ likes/<id>/'
    // Must use the literal space (not %20) so Django's URL router matches it.
    return await api.post(`notes/ likes/${id}/`);
  },

  getComments: async (id) => {
    const response = await api.get(`notes/comment/${id}/`);
    return response.data;
  },

  addComment: async (id, comment) => {
    return await api.post(`notes/comment/${id}/`, { comment });
  },

  deleteComment: async (id) => {
    return await api.delete(`notes/comment/${id}/`);
  },

  // DOWNLOAD TRACKING
  recordDownload: async (id) => {
    return await api.post(`notes/download/${id}/`);
  },

  getDownloads: async () => {
    const response = await api.get('notes/downloads/');
    return response.data;
  },

  getNotifications: async () => {
    const response = await api.get('notes/notification/');
    return response.data;
  }
};

export default noteService;
