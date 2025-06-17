import { useAuth } from '../contexts/AuthContext';
import { AgentDashboard } from '../sections/AgentDashboard';
import { BuyerDashboard } from '../sections/BuyerDashboard';
import { AdminDashboard } from '../sections/AdminDashboard';
import { Container } from '@mui/material';

export const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth='xl'>
      {user?.role === "Agent" ? (
        <AgentDashboard />
      ) : user?.role === "Buyer" ? (
        <BuyerDashboard />
      ) : user?.role === "Admin" ? (
        <AdminDashboard />
      ) : (<></>)}
    </Container>
  )
}