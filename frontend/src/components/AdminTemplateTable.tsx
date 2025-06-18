import {
  Paper, Typography, TableContainer, Table, TableHead, TableRow,
  TableCell, TableBody, Button, useTheme, useMediaQuery,
  Card, CardContent, CardActions, Stack, Box
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import apiClient from '../api/apiClient';
import { useState } from 'react';
// The Dialog related imports and PdfViewer are no longer needed

interface Template {
  id: string;
  title: string;
}

interface Owner {
  email: string;
}

interface Submission {
  created_at: string;
  filled_pdf_url?: string;
  anvil_submission_eid: string;
}

interface DashboardItem {
  template: Template;
  owner: Owner;
  latest_submission?: Submission;
}

interface TemplateTableProps {
  data: DashboardItem[];
}

export const TemplateTable = ({ data }: TemplateTableProps) => {
  // We only need the loading state now. The pdfUrl state is removed.
  const [loadingPdf, setLoadingPdf] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const handleDownloadPdf = async (submission_id: string) => {
    setLoadingPdf(submission_id);
    try {
      const response = await apiClient.get(
        `/api/submissions/${submission_id}/download`,
        {
          responseType: 'blob'
        }
      );

      // --- START: PDF Download Logic ---

      // 1. Create a blob from the response data
      const file = new Blob([response.data], { type: 'application/pdf' });

      // 2. Create a temporary URL for the blob
      const fileURL = URL.createObjectURL(file);

      // 3. Create a temporary anchor element and set the download attribute
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', `submission-${submission_id}.pdf`); // Set the desired file name here

      // 4. Append to the document, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 5. Clean up the temporary URL
      window.URL.revokeObjectURL(fileURL);

      // --- END: PDF Download Logic ---

    } catch (error) {
      console.error("Error fetching the PDF", error);
    } finally {
      setLoadingPdf(null);
    }
  };

  // The handleClosePdf function is no longer needed.

  if (isMobile || isTablet) {
    return (
      <Stack spacing={2} sx={{ mt: 2 }}>
        {data.map((item) => (
          <Card key={item.template.id}>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                {item.template.title}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Owner (Agent)
                </Typography>
                <Typography variant="body1">
                  {item.owner.email}
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Latest Submission
                </Typography>
                <Typography variant="body1">
                  {item.latest_submission 
                    ? new Date(item.latest_submission.created_at).toLocaleDateString()
                    : 'No submission yet'}
                </Typography>
              </Box>
            </CardContent>
            
            <CardActions>
              {item.latest_submission && item.latest_submission.filled_pdf_url ? (
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<DownloadIcon htmlColor="#f73b20" />}
                  onClick={() => handleDownloadPdf(item.latest_submission.anvil_submission_eid)}
                  disabled={loadingPdf === item.latest_submission.anvil_submission_eid}
                  sx={{ 
                    color: '#f73b20', 
                    backgroundColor: '#f73b200d', 
                    border: 'none',
                    '&:hover': {
                      backgroundColor: '#f73b201a',
                      border: 'none'
                    }
                  }}
                >
                  {loadingPdf === item.latest_submission.anvil_submission_eid ? 'Loading...' : 'Download PDF'}
                </Button>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>
                  No PDF available
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
            <TableCell sx={{ fontWeight: 'bold' }}>Template Name</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Owner (Agent)</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Latest Submission Created</TableCell>
            <TableCell sx={{ fontWeight: 'bold' }}>Download PDF</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.template.id}>
              <TableCell>{item.template.title}</TableCell>
              <TableCell>{item.owner.email}</TableCell>
              <TableCell>
                {item.latest_submission 
                  ? new Date(item.latest_submission.created_at).toLocaleDateString() 
                  : 'N/A'}
              </TableCell>
              <TableCell>
                {item.latest_submission && item.latest_submission.filled_pdf_url ? (
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon htmlColor='#f73b20' />}
                    sx={{ 
                      color: '#f73b20', 
                      backgroundColor: '#f73b200d', 
                      border: 'none',
                      '&:hover': {
                        backgroundColor: '#f73b201a',
                        border: 'none'
                      }
                    }}
                    onClick={() => handleDownloadPdf(item.latest_submission.anvil_submission_eid)}
                    disabled={loadingPdf === item.latest_submission.anvil_submission_eid}
                  >
                    {loadingPdf === item.latest_submission.anvil_submission_eid ? 'Loading...' : 'Download'}
                  </Button>
                ) : (
                  'No submission'
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};