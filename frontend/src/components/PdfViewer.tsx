import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Box, CircularProgress, Typography, Pagination } from '@mui/material';

// Required for react-pdf to work with Create React App/Vite
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface PdfViewerProps {
  pdfUrl: string;
}

export const PdfViewer = ({ pdfUrl }: PdfViewerProps) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setPageNumber(1); // Reset to first page on new document load
    setError(null);
  }

  function onDocumentLoadError(error: Error): void {
    console.error('PDF load error:', error);
    setError('Failed to load PDF. Please try again.');
  }

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPageNumber(value);
  };

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress sx={{ color: '#f73b20' }} /></Box>}
        error={<Typography color="error" sx={{ p: 4 }}>Failed to load PDF.</Typography>}
      >
        <Box sx={{ 
          backgroundColor: 'white', 
          borderRadius: 1, 
          boxShadow: 3, 
          p: 2, 
          mb: 2,
          border: '1px solid #e0e0e0'
        }}>
          <Page 
            pageNumber={pageNumber} 
            width={Math.min(window.innerWidth * 0.8, 800)}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Box>
      </Document>
      {numPages && (
        <Pagination
          count={numPages}
          page={pageNumber}
          onChange={handlePageChange}
          sx={{ 
            mt: 2, 
            mb: 1,
            '& .MuiPaginationItem-root': {
              backgroundColor: '#f5f5f5',
              color: '#333',
              border: '1px solid #ddd',
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
              '&.Mui-selected': {
                backgroundColor: '#f73b20',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#f73b209d',
                }
              }
            }
          }}
        />
      )}
    </Box>
  );
}