import { Alert, AlertTitle, Collapse, SxProps } from '@mui/material';

interface ErrorFeedbackProps {
  error?: string | null;
  title?: string;
  sx?: SxProps;
}

export const ErrorFeedback = ({
  error,
  title = 'Error',
  sx
}: ErrorFeedbackProps) => {
  return (
    <Collapse in={!!error}>
      {error && (
        <Alert
          severity="error"
          sx={{
            mt: 2,
            mb: 2,
            '& .MuiAlert-message': {
              width: '100%'
            },
            ...sx
          }}
        >
          <AlertTitle>{title}</AlertTitle>
          {error}
        </Alert>
      )}
    </Collapse>
  );
}; 