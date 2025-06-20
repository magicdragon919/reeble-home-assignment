import {
  Paper, Typography, TableContainer, Table, TableHead, TableRow,
  TableCell, TableBody, Button
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

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
                <TableCell sx={{ fontWeight: 'bold' }}>Latest Submission By</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Download</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>
                    {item.latest_submission ? `User ID: ${item.latest_submission.buyer_id}` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {item.latest_submission?.filled_pdf_url ? (
                      <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        href={item.latest_submission.filled_pdf_url}
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
    </>
  )
}

