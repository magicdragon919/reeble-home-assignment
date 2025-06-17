import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { UploadTemplateModal } from '../components/UploadTemplateModal';
import {
  Paper, Typography, Box, Button, CircularProgress,
  Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Define a type for our template data, assuming it has these fields from the API
interface Template {
  id: string; // Or a unique identifier like anvil_template_eid
  title: string;
  filename: string;
  created_at: string;
}

export const AgentDashboard = () => {
  // State for managing the list of templates and UI feedback
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // State to control the upload modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetches the list of templates from the backend
  const fetchTemplates = async () => {
    setIsFetching(true);
    setFetchError('');
    try {
      const response = await apiClient.get<Template[]>('/api/templates');
      setTemplates(response.data);
    } catch (error) {
      setFetchError('Failed to load templates. Please try refreshing the page.');
      console.error(error);
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

  // Placeholder for a delete action
  const handleDeleteTemplate = (templateId: string) => {
    // Here you would add the logic to call your API endpoint to delete the template
    // For example: await apiClient.delete(`/api/templates/${templateId}`);
    // And then refresh the list: fetchTemplates();
    alert(`(Placeholder) Delete template with ID: ${templateId}`);
  };

  return (
    <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, width: '100%' }}>
      {/* --- HEADER --- */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1">
          Template Management
        </Typography>
        <Button variant="contained" size="large" onClick={() => setIsModalOpen(true)}>
          Upload New Template
        </Button>
      </Box>

      {/* --- TEMPLATES TABLE --- */}
      <Typography variant="h6" gutterBottom>
        My Uploaded Templates
      </Typography>

      {/* Handle Loading and Error States */}
      {isFetching ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : fetchError ? (
        <Alert severity="error" sx={{ mt: 2 }}>{fetchError}</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table aria-label="templates table">
            {/* Table Header */}
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Template Title</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date Uploaded</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            {/* Table Body */}
            <TableBody>
              {templates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No templates found. Upload your first one!
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((template) => (
                  <TableRow
                    key={template.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    hover
                  >
                    <TableCell component="th" scope="row">
                      {template.title}
                    </TableCell>
                    <TableCell>{new Date(template.created_at).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <IconButton aria-label="view" color="primary">
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton aria-label="delete" color="error" onClick={() => handleDeleteTemplate(template.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* --- RENDER THE UPLOAD MODAL --- */}
      <UploadTemplateModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </Paper>
  );
};