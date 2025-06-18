import { Container, ContainerProps } from '@mui/material';

interface ResponsiveContainerProps extends Omit<ContainerProps, 'maxWidth'> {
  size?: 'small' | 'medium' | 'large';
}

export const ResponsiveContainer = ({
  size = 'medium',
  children,
  ...props
}: ResponsiveContainerProps) => {
  const getMaxWidth = () => {
    switch (size) {
      case 'small':
        return 'sm'; // 600px
      case 'large':
        return 'lg'; // 1200px
      case 'medium':
      default:
        return 'md'; // 900px
    }
  };

  return (
    <Container
      maxWidth={getMaxWidth()}
      sx={{
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2, sm: 3 },
        ...props.sx
      }}
      {...props}
    >
      {children}
    </Container>
  );
}; 