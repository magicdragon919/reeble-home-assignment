import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import {
  Paper, Typography, Box, useTheme, useMediaQuery
} from '@mui/material';
import { TemplateTable } from '../components/AdminTemplateTable';
import { EmptyState } from '../components/EmptyState';
import { ErrorFeedback } from '../components/ErrorFeedback';
import { ResponsiveContainer } from '../components/ResponsiveContainer';
import { Assessment as AssessmentIcon } from '@mui/icons-material';

interface DashboardData {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

export const AdminDashboard = () => {
  const [data, setData] = useState<DashboardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get<DashboardData[]>('/api/dashboard');
        setData(response.data);
      } catch (err) {
        setError('Failed to fetch dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Box sx={{ color: '#f73b20' }}>Loading...</Box>
        </Box>
      );
    }

    if (error) {
      return <ErrorFeedback error={error} />;
    }

    if (data.length === 0) {
      return (
        <EmptyState
          title="No Data Available"
          description="There is no dashboard data to display at the moment."
          icon={<AssessmentIcon sx={{ color: '#f73b20' }} />}
        />
      );
    }

    return <TemplateTable data={data} />;
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
            Admin Dashboard
          </Typography>
        </Box>

        {renderContent()}
      </Paper>
    </ResponsiveContainer>
  );
};