import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { UploadTemplateModal } from '../components/UploadTemplateModal';
import {
  Paper, Typography, Box, Button, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  IconButton, useTheme, useMediaQuery,
  Card, CardContent, CardActions, Stack, CircularProgress
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  Upload as UploadIcon,
  Description as DescriptionIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { EmptyState } from '../components/EmptyState';
import { ErrorFeedback } from '../components/ErrorFeedback';
import { ResponsiveContainer } from '../components/ResponsiveContainer';

// Define a type for our template data, assuming it has these fields from the API
interface Template {
  id: string;
  title: string;
  description?: string;
  created_at: string;
}

export const AgentDashboard = () => {
  // State for managing the list of templates and UI feedback
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // State to control the upload modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Fetches the list of templates from the backend
  const fetchTemplates = async () => {
    setIsFetching(true);
    setFetchError('');
    try {
      const response = await apiClient.get('/api/templates');
      // The API returns { templates: [...] }
      const templatesData = response.data || [];
      setTemplates(templatesData);
    } catch (error) {
      setFetchError('Failed to load templates. Please try refreshing the page.');
    } finally {
      setIsFetching(false);
    }
  };

  // Initial data fetch when the component mounts
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Callback function for the modal to trigger a data refresh after a successful upload
  const handleUploadSuccess = () => {
    fetchTemplates();
  };

  const handleDownload = async (template: Template) => {
    if (!template?.id) return;
    try {
      const response = await apiClient.get(`/api/templates/${template.id}/download`);
      // Handle PDF download based on your API response
      window.open(response.data.download_url, '_blank');
    } catch (error) {
      console.error('Failed to download template:', error);
    }
  };

  const handleDelete = async (template: Template) => {
    if (!template?.id) return;
    try {
      await apiClient.delete(`/api/templates/${template.id}`);
      fetchTemplates(); // Refresh the list
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const renderTemplatesList = () => {
    if (isFetching) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: '#f73b20' }} />
        </Box>
      );
    }

    if (fetchError) {
      return <ErrorFeedback error={fetchError} />;
    }

    if (!templates || templates.length === 0) {
      return (
        <EmptyState
          title="No Templates Yet"
          description="Start by uploading your first template."
          icon={<DescriptionIcon sx={{ color: '#f73b20' }} />}
          // action={{
          //   label: "Upload Template",
          //   onClick: () => setIsModalOpen(true)
          // }}
        />
      );
    }

    if (isMobile || isTablet) {
      return (
        <Stack spacing={2}>
          {Array.isArray(templates) && templates.map((template) => (
            <Card key={template?.id || Math.random()}>
              <CardContent>
                <Typography variant="h6" component="div" noWrap>
                  {template?.title || 'Untitled Template'}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {template?.created_at ? new Date(template.created_at).toLocaleDateString() : 'Unknown date'}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<VisibilityIcon htmlColor="#f73b20" />}
                  onClick={() => handleDownload(template)}
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
                  View Template
                </Button>
              </CardActions>
            </Card>
          ))}
        </Stack>
      );
    }

    return (
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table aria-label="templates table">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Template Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date Uploaded</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(templates) && templates?.map((template) => (
              <TableRow
                key={template?.id || Math.random()}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                hover
              >
                <TableCell component="th" scope="row">
                  {template?.title || 'Untitled Template'}
                </TableCell>
                <TableCell>
                  {template?.created_at ? new Date(template.created_at).toLocaleDateString() : 'Unknown date'}
                </TableCell>
                <TableCell align="right">
                  <IconButton 
                    aria-label="view template"
                    onClick={() => handleDownload(template)}
                    sx={{ 
                      color: '#f73b20',
                      '&:hover': {
                        backgroundColor: '#f73b200d'
                      }
                    }}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton 
                    aria-label="delete template"
                    onClick={() => handleDelete(template)}
                    sx={{ 
                      color: '#f73b20',
                      '&:hover': {
                        backgroundColor: '#f73b200d'
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
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
              color: '#f73b20',
              fontWeight: 'bold'
            }}
          >
            Template Management
          </Typography>
          <Button
            variant="contained"
            size={isMobile ? 'large' : 'medium'}
            onClick={() => setIsModalOpen(true)}
            startIcon={<UploadIcon />}
            fullWidth={isMobile}
            sx={{ 
              backgroundColor: '#f73b20f0',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#f73b20'
              }
            }}
          >
            Upload New Template
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
          My Uploaded Templates
        </Typography>

        {renderTemplatesList()}

        <UploadTemplateModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      </Paper>
    </ResponsiveContainer>
  );
};