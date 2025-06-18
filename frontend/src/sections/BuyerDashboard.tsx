import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { CreateSubmissionModal } from '../components/CreateSubmissionModal'; // Import the new modal
import {
  Paper, Typography, Box, Button, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogContent, DialogTitle
} from '@mui/material';
import { Visibility as VisibilityIcon, Close as CloseIcon } from '@mui/icons-material';
import { PdfViewer } from '../components/PdfViewer';

// Define a type for a submission
interface Submission {
  id: string;
  title: string; // The title of the form that was submitted
  submitted_at: string;
  download_url?: string;
}

export const BuyerDashboard = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState<string | null>(null);

  const handleViewPdf = async (submission_id: string) => {
    setLoadingPdf(submission_id);
    try {
      const response = await apiClient.get(
        `/api/submissions/${submission_id}/download`,
        {
          responseType: 'blob'
        }
      );
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      console.log(fileURL);
      setPdfUrl(fileURL);
    } catch (error) {
      console.error("Error fetching the PDF", error);
    } finally {
      setLoadingPdf(null);
    }
  };

  const handleClosePdf = () => {
    if (pdfUrl) {
      window.URL.revokeObjectURL(pdfUrl);
    }
    setPdfUrl(null);
  };

  // Function to fetch the list of previous submissions
  const fetchSubmissions = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.get<Submission[]>('/api/submissions'); // Assumes this endpoint exists
      setSubmissions(response.data);
    } catch (err) {
      setError('Could not fetch previous submissions.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when the component mounts
  useEffect(() => {
    fetchSubmissions();
  }, []);

  // This function will be called by the modal on success
  const handleSubmitSuccess = () => {
    fetchSubmissions(); // Refetch the list to include the new submission
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h2" component="h1" color='#f73b20'>Buyer Dashboard</Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => setIsModalOpen(true)}
          sx={{ color: '#fff', backgroundColor: '#f73b20f0' }}
        >
          Fill New Form
        </Button>
      </Box>

      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>My Previous Submissions</Typography>

      {isLoading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : submissions.length === 0 ? (
        <Typography sx={{ mt: 3 }}>You have not submitted any forms yet.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Form Title</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date Submitted</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {submissions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>{sub.template.title}</TableCell>
                  <TableCell>{new Date(sub.created_at).toLocaleDateString()}</TableCell>
                  <TableCell align='right'>
                    {sub.filled_pdf_url ? (
                      <Button
                        rel="noopener noreferrer"
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon htmlColor='#f73b20' />}
                        sx={{ color: '#f73b20', border: 'none', backgroundColor: '#f73b200d' }}
                        onClick={() => handleViewPdf(sub.anvil_submission_eid)}
                        disabled={loadingPdf === sub.anvil_submission_eid}
                      >
                        View
                      </Button>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Not Available
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Render the Modal */}
      <CreateSubmissionModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitSuccess={handleSubmitSuccess}
      />

      {/* --- PDF MODAL DIALOG --- */}
      <Dialog
        open={!!pdfUrl}
        onClose={handleClosePdf}
        fullWidth={true}
        maxWidth="lg"
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          PDF Preview
          <Button onClick={handleClosePdf} startIcon={<CloseIcon />}>
            Close
          </Button>
        </DialogTitle>
        <DialogContent dividers>
          {/* We only render the viewer if the URL exists */}
          {pdfUrl && <PdfViewer pdfUrl={pdfUrl} />}
        </DialogContent>
      </Dialog>
    </Paper>
  );
};