import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { CreateSubmissionModal } from '../components/CreateSubmissionModal';
import {
  Paper, Typography, Box, Button, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogContent, DialogTitle, useTheme, useMediaQuery,
  Card, CardContent, CardActions, Stack
} from '@mui/material';
import { 
  Visibility as VisibilityIcon, 
  Close as CloseIcon,
  Description as DescriptionIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { PdfViewer } from '../components/PdfViewer';
import { EmptyState } from '../components/EmptyState';
import { ErrorFeedback } from '../components/ErrorFeedback';
import { ResponsiveContainer } from '../components/ResponsiveContainer';

// Define a type for a submission
interface Submission {
  id: string;
  template: {
    title: string;
  };
  created_at: string;
  anvil_submission_eid: string;
  filled_pdf_url?: string;
}

export const BuyerDashboard = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loadingPdf, setLoadingPdf] = useState<string | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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
      setPdfUrl(fileURL);
    } catch (error) {
      setError('Failed to load PDF. Please try again.');
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

  const fetchSubmissions = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiClient.get<Submission[]>('/api/submissions');
      setSubmissions(response.data);
    } catch (err) {
      setError('Could not fetch your submissions. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleSubmitSuccess = () => {
    fetchSubmissions();
  };

  const renderSubmissionsList = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: '#f73b20' }} />
        </Box>
      );
    }

    if (error) {
      return <ErrorFeedback error={error} />;
    }

    if (submissions.length === 0) {
      return (
        <EmptyState
          title="No Submissions Yet"
          description="Start by filling out a new form to submit your first document."
          icon={<DescriptionIcon sx={{ color: '#f73b20' }} />}
          action={{
            label: "Fill New Form",
            onClick: () => setIsModalOpen(true)
          }}
        />
      );
    }

    if (isMobile || isTablet) {
      return (
        <Stack spacing={2}>
          {submissions.map((sub) => (
            <Card key={sub.id}>
              <CardContent>
                <Typography variant="h6" component="div" noWrap>
                  {sub.template.title}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {new Date(sub.created_at).toLocaleDateString()}
                </Typography>
              </CardContent>
              <CardActions>
                {sub.filled_pdf_url ? (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<VisibilityIcon htmlColor="#f73b20" />}
                    onClick={() => handleViewPdf(sub.anvil_submission_eid)}
                    disabled={loadingPdf === sub.anvil_submission_eid}
                    sx={{ 
                      color: '#f73b20', 
                      border: 'none', 
                      backgroundColor: '#f73b200d',
                      '&:hover': {
                        backgroundColor: '#f73b201a',
                        border: 'none'
                      }
                    }}
                  >
                    {loadingPdf === sub.anvil_submission_eid ? 'Loading...' : 'View PDF'}
                  </Button>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    PDF Not Available
                  </Typography>
                )}
              </CardActions>
            </Card>
          ))}
        </Stack>
      );
    }

    return (
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
                <TableCell align="right">
                  {sub.filled_pdf_url ? (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VisibilityIcon htmlColor="#f73b20" />}
                      onClick={() => handleViewPdf(sub.anvil_submission_eid)}
                      disabled={loadingPdf === sub.anvil_submission_eid}
                      sx={{ 
                        color: '#f73b20', 
                        border: 'none', 
                        backgroundColor: '#f73b200d',
                        '&:hover': {
                          backgroundColor: '#f73b201a',
                          border: 'none'
                        }
                      }}
                    >
                      {loadingPdf === sub.anvil_submission_eid ? 'Loading...' : 'View'}
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
    );
  };

  return (
    <ResponsiveContainer size="large">
      <Paper sx={{ 
        p: { xs: 2, sm: 3, md: 4 },
        borderRadius: { xs: 0, sm: 2 }
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: { xs: 2, sm: 0 },
          mb: 3 
        }}>
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              color: '#f73b20'
            }}
          >
            Buyer Dashboard
          </Typography>
          <Button
            variant="contained"
            size={isMobile ? 'large' : 'medium'}
            onClick={() => setIsModalOpen(true)}
            startIcon={<AddIcon />}
            fullWidth={isMobile}
            sx={{ 
              backgroundColor: '#f73b20f0',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#f73b20'
              }
            }}
          >
            Fill New Form
          </Button>
        </Box>

        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 'bold',
            mb: 2,
            fontSize: { xs: '1.25rem', sm: '1.5rem' }
          }}
        >
          My Previous Submissions
        </Typography>

        {renderSubmissionsList()}

        <CreateSubmissionModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmitSuccess={handleSubmitSuccess}
        />

        <Dialog
          open={!!pdfUrl}
          onClose={handleClosePdf}
          fullScreen={isMobile}
          fullWidth={true}
          maxWidth="lg"
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            p: { xs: 2, sm: 3 }
          }}>
            <Typography variant="h6" component="span">
              PDF Preview
            </Typography>
            <Button 
              onClick={handleClosePdf} 
              startIcon={<CloseIcon />}
              size={isMobile ? 'small' : 'medium'}
              sx={{ 
                color: '#f73b20',
                '&:hover': {
                  backgroundColor: '#f73b200d'
                }
              }}
            >
              Close
            </Button>
          </DialogTitle>
          <DialogContent dividers>
            {pdfUrl && <PdfViewer pdfUrl={pdfUrl} />}
          </DialogContent>
        </Dialog>
      </Paper>
    </ResponsiveContainer>
  );
};