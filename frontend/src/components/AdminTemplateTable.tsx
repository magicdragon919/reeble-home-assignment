import {
  Paper, Typography, TableContainer, Table, TableHead, TableRow,
  TableCell, TableBody, Button
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';

export const TemplateTable = ({ data }: any) => {
  console.log("Templates: ", data);
  return (
    <>
      {data.length === 0 ? (
        <Typography sx={{ mt: 3 }}>No templates have been uploaded yet.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Template Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Owner (Agent)</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Latest Submission Created</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>View</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item: any) => (
                <TableRow key={item.template.id}>
                  <TableCell>{item.template.title}</TableCell>
                  <TableCell>{item.owner.email}</TableCell>
                  <TableCell>
                    {item.latest_submission ? (new Date(item.latest_submission.created_at).toLocaleDateString()) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {item.latest_submission?.filled_pdf_url ? (
                      <Button
                        variant="outlined"
                        startIcon={<VisibilityIcon htmlColor='#f73b20' />}
                        href={item.latest_submission.filled_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ color: '#f73b20', backgroundColor: '#f73b200d', border: 'none' }}
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
    </>
  )
}

