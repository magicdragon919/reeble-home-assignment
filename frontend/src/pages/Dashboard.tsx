import { useAuth } from '../contexts/AuthContext';
import { AgentDashboard } from '../sections/AgentDashboard';
import { BuyerDashboard } from '../sections/BuyerDashboard';
import { AdminDashboard } from '../sections/AdminDashboard';
import { EmptyState } from '../components/EmptyState';
import { ResponsiveContainer } from '../components/ResponsiveContainer';
import { ErrorOutline } from '@mui/icons-material';

export const Dashboard = () => {
  const { user } = useAuth();

  return (
    <ResponsiveContainer size="large">
      {user?.role === "Agent" ? (
        <AgentDashboard />
      ) : user?.role === "Buyer" ? (
        <BuyerDashboard />
      ) : user?.role === "Admin" ? (
        <AdminDashboard />
      ) : (
        <EmptyState
          title="Invalid User Role"
          description="You don't have access to any dashboard. Please contact support if you think this is an error."
          icon={<ErrorOutline />}
          variant="error"
        />
      )}
    </ResponsiveContainer>
  );
};