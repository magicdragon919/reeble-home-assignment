// src/pages/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { AdminDashboardData } from '../types';
import {
  Paper, Typography, TableContainer, Table, TableHead, TableRow,
  TableCell, TableBody, Alert, CircularProgress, Box, Button
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

export const AdminDashboard = () => {
  const [data, setData] = useState<AdminDashboardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get<AdminDashboardData[]>('/api/dashboard');
        setData(response.data);
      } catch (err) {
        setError('Failed to fetch dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <Box display="flex" justifyContent="center"><CircularProgress /></Box>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Paper sx={{ p: 4 }}>
      <Typography variant="h2" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      {data.length === 0 ? (
        <Typography sx={{ mt: 3 }}>No templates have been uploaded yet.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Template Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Owner (Agent)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Latest Submission By</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Download</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.owner.email}</TableCell>
                  <TableCell>
                    {item.latest_submission ? `User ID: ${item.latest_submission.buyer_id}` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {item.latest_submission?.filled_pdf_url ? (
                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        href={`${import.meta.env.VITE_API_URL}${item.latest_submission.filled_pdf_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        PDF
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
      )}
    </Paper>
  );
};