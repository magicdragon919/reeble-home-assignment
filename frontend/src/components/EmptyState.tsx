import { Box, Typography, Button, SxProps } from '@mui/material';
import { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'error';
  sx?: SxProps;
}

export const EmptyState = ({
  title,
  description,
  icon,
  action,
  variant = 'default',
  sx
}: EmptyStateProps) => {
  const getColor = () => {
    return variant === 'error' ? 'error.main' : 'text.secondary';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: { xs: 2, sm: 3 },
        minHeight: '200px',
        ...sx
      }}
    >
      {icon && (
        <Box
          sx={{
            color: getColor(),
            fontSize: { xs: '3rem', sm: '4rem' },
            marginBottom: 2,
            '& > *': {
              fontSize: 'inherit'
            }
          }}
        >
          {icon}
        </Box>
      )}
      
      <Typography
        variant="h6"
        component="h2"
        color={getColor()}
        sx={{
          marginBottom: 1,
          fontSize: { xs: '1.125rem', sm: '1.25rem' }
        }}
      >
        {title}
      </Typography>
      
      {description && (
        <Typography
          color="text.secondary"
          sx={{
            maxWidth: '400px',
            marginBottom: action ? 3 : 0,
            fontSize: { xs: '0.875rem', sm: '1rem' }
          }}
        >
          {description}
        </Typography>
      )}
      
      {action && (
        <Button
          variant="contained"
          color={variant === 'error' ? 'error' : 'primary'}
          onClick={action.onClick}
          sx={{
            marginTop: 2
          }}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
}; 