import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import {
  Paper, Typography, Alert, CircularProgress, Box
} from '@mui/material';
import { TemplateTable } from '../components/AdminTemplateTable';

export const AdminDashboard = () => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get<any[]>('/api/dashboard');
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
      <Typography variant="h2" component="h1" gutterBottom color='#f73b20'>
        Admin Dashboard
      </Typography>
      <TemplateTable data={data}/>
    </Paper>
  );
};