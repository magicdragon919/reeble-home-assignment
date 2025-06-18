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

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setPageNumber(1); // Reset to first page on new document load
  }

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPageNumber(value);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}
        error={<Typography color="error" sx={{ p: 4 }}>Failed to load PDF.</Typography>}
      >
        <Page pageNumber={pageNumber} />
      </Document>
      {numPages && (
        <Pagination
          count={numPages}
          page={pageNumber}
          onChange={handlePageChange}
          color="primary"
          sx={{ mt: 2, mb: 1 }}
        />
      )}
    </Box>
  );
}