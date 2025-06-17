import { useAuth } from '../contexts/AuthContext';
import { AgentDashboard } from './AgentDashboard';
import { BuyerDashboard } from './BuyerDashboard';
import { AdminDashboard } from './AdminDashboard';

export const Dashboard = () => {
  const { user } = useAuth();

  return (
    <>
      {user?.role === "Agent" ? (
        <AgentDashboard />
      ) : user?.role === "Buyer" ? (
        <BuyerDashboard />
      ) : user?.role === "Admin" ? (
        <AdminDashboard />
      ) : (<></>)}
    </>
  )
}