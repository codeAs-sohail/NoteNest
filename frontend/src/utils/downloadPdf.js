import noteService from '../services/noteService';
import toast from 'react-hot-toast';

export const getFullUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  
  let baseApi = import.meta.env.VITE_API_URL || '';
  let base = baseApi.replace(/\/api\/?$/, '');
  
  if (base === '' && window.location.hostname === 'localhost') {
    base = 'http://localhost:8000';
  }
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
};


export const downloadPdf = async (pdfUrl, filename = 'note.pdf', noteId = null) => {
  const loadingToast = toast.loading('Initiating secure download...');
  try {
    const fullUrl = getFullUrl(pdfUrl);
    const token = localStorage.getItem('notenest_access');
    const response = await fetch(fullUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) throw new Error('Network error or CORS block');

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (noteId) {
      try {
        await noteService.recordDownload(noteId);
      } catch (err) { }
    }

    toast.success('Download complete!', { id: loadingToast });
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch (error) {
    console.error("Download fetch failed", error);
    toast.error('Direct download failed due to browser security. Opening file...', { id: loadingToast });
    // Safe fallback that opens it if strictly necessary due to hardcore CORS blocking on Cloudinary without setup
    window.location.href = getFullUrl(pdfUrl);
  }
};
