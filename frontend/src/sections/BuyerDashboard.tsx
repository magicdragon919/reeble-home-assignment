import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { CreateSubmissionModal } from '../components/CreateSubmissionModal'; // Import the new modal
import {
  Paper, Typography, Box, Button, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';

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
        <Typography variant="h2" component="h1">Buyer Dashboard</Typography>
        <Button variant="contained" size="large" onClick={() => setIsModalOpen(true)}>
          Fill New Form
        </Button>
      </Box>

      <Typography variant="h4" gutterBottom>My Previous Submissions</Typography>

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
                <TableCell>Form Title</TableCell>
                <TableCell>Date Submitted</TableCell>
                <TableCell align="right">Actions</TableCell>
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
                        component="a"
                        href={sub.filled_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon />}
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
    </Paper>
  );
};