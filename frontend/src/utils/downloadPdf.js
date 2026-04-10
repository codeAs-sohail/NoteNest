import noteService from '../services/noteService';

/**
 * Forces a browser download of a PDF file using fetch + blob.
 * Also records the download event to the backend if noteId is provided.
 */
export const downloadPdf = async (pdfUrl, filename = 'note.pdf', noteId = null) => {
  try {
    const token = localStorage.getItem('notenest_access');
    const response = await fetch(pdfUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) throw new Error('Network response was not ok');

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Record the download event in the backend
    if (noteId) {
      try {
        await noteService.recordDownload(noteId);
      } catch (err) {
        console.warn('Failed to record download event:', err);
      }
    }

    // Clean up the blob URL after a short delay
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch {
    // Graceful fallback — open in new tab
    window.open(pdfUrl, '_blank');
  }
};
