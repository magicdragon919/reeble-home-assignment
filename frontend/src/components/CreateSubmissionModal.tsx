import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { PDFTemplate, AnvilField } from '../types'; // Assuming you have these types defined
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, FormControl, InputLabel, Select,
  MenuItem, SelectChangeEvent, TextField, CircularProgress, Alert, InputAdornment,
  FormControlLabel, FormLabel, Checkbox, RadioGroup, Radio // (and other field types)
} from '@mui/material';

// --- (You can move your renderField function here) ---
const renderField = (field: AnvilField, formData: Record<string, any>, handleInputChange: (e: any) => void) => {
  // This function is the same as the one in your original code.
  // We pass formData and handleInputChange as arguments now.
  const { id, name, type } = field;
  const value = formData[id] || '';

  switch (type) {
    case 'shortText': case 'fullName': case 'usAddress':
      return <TextField key={id} name={id} label={name} value={value} onChange={handleInputChange} fullWidth={true} />;
    case 'longText': case 'textWrap':
      return <TextField key={id} name={id} label={name} value={value} onChange={handleInputChange} fullWidth={true} multiline rows={4} />;
    case 'date':
      return <TextField key={id} name={id} label={name} value={value} onChange={handleInputChange} fullWidth={true} type="date" InputLabelProps={{ shrink: true }} />;
    case 'email':
      return <TextField key={id} name={id} label={name} value={value} onChange={handleInputChange} fullWidth={true} type="email" />;
    case 'phone':
      return <TextField key={id} name={id} label={name} value={value} onChange={handleInputChange} fullWidth={true} type="tel" />;
    case 'number':
      return <TextField key={id} name={id} label={name} value={value} onChange={handleInputChange} fullWidth={true} type="number" />;
    case 'dollar':
      return <TextField key={id} name={id} label={name} value={value} onChange={handleInputChange} fullWidth={true} type="number" InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />;
    case 'percent':
      return <TextField key={id} name={id} label={name} value={value} onChange={handleInputChange} fullWidth={true} type="number" InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />;
    case 'charList':
      return <TextField key={id} name={id} label={name} value={value} onChange={handleInputChange} fullWidth={true} inputProps={{ style: { letterSpacing: '0.5em', fontFamily: 'monospace' } }} />;
    case 'checkbox':
      return <FormControlLabel key={id} control={<Checkbox name={id} checked={!!value} onChange={handleInputChange} />} label={name} />;
    case 'radioGroup':
      return (
        <FormControl key={id} component="fieldset" fullWidth={true}>
          <FormLabel component="legend">{name}</FormLabel>
          <RadioGroup row name={id} value={value} onChange={handleInputChange}>
            <FormControlLabel value="option1" control={<Radio />} label="Option 1" />
            <FormControlLabel value="option2" control={<Radio />} label="Option 2" />
            <FormControlLabel value="option3" control={<Radio />} label="Option 3" />
          </RadioGroup>
        </FormControl>
      );
    default:
      return <TextField key={id} name={id} label={`${name} (type: ${type})`} value={value} fullWidth onChange={handleInputChange} />;
  }
};


interface CreateSubmissionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export const CreateSubmissionModal = ({ open, onClose, onSubmitSuccess }: CreateSubmissionModalProps) => {
  // All state related to form filling now lives inside the modal
  const [templates, setTemplates] = useState<PDFTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [fields, setFields] = useState<AnvilField[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isLoadingForm, setIsLoadingForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  // Effect to fetch templates when the modal is first opened
  useEffect(() => {
    if (open) {
      const fetchTemplates = async () => {
        setIsLoadingTemplates(true);
        try {
          const response = await apiClient.get<PDFTemplate[]>('/api/templates/available');
          setTemplates(response.data);
        } catch (error) {
          setFeedback({ message: 'Could not fetch available forms.', severity: 'error' });
        } finally {
          setIsLoadingTemplates(false);
        }
      };
      fetchTemplates();
    }
  }, [open]);

  // Effect to fetch fields when a template is selected
  useEffect(() => {
    // This entire effect is moved directly from your original component
    if (!selectedTemplateId) {
      setFields([]);
      setFormData({});
      return;
    }
    const fetchFields = async () => {
      setIsLoadingForm(true);
      setFeedback(null);
      try {
        const response = await apiClient.get<{ fields: AnvilField[] }>(`/api/templates/${selectedTemplateId}/fields`);
        setFields(response.data.fields || []);
      } catch (error) {
        setFeedback({ message: 'Could not load the selected form.', severity: 'error' });
      } finally {
        setIsLoadingForm(false);
      }
    };
    fetchFields();
  }, [selectedTemplateId]);

  const handleTemplateChange = (event: SelectChangeEvent<string>) => setSelectedTemplateId(event.target.value);
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);
    try {
      await apiClient.post(`/api/templates/${selectedTemplateId}/submissions`, formData);
      setFeedback({ message: `Submission successful!`, severity: 'success' });
      onSubmitSuccess();
      setTimeout(() => onClose(), 1500); // Close modal after showing success message
    } catch (error) {
      setFeedback({ message: 'Submission failed. Please try again.', severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Fill New Form</DialogTitle>
      <DialogContent>
        {/* All the form rendering logic now lives here */}
        {isLoadingTemplates ? (<CircularProgress />) : (
          <FormControl fullWidth margin="normal">
            <InputLabel id="template-select-label">Select a Form</InputLabel>
            <Select labelId="template-select-label" value={selectedTemplateId} label="Select a Form" onChange={handleTemplateChange}>
              {Array.isArray(templates) && templates.map((template) => (<MenuItem key={template.anvil_template_eid} value={template.anvil_template_eid}>{template.title}</MenuItem>))}
            </Select>
          </FormControl>
        )}

        {isLoadingForm && <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>}

        {fields.length > 0 && !isLoadingForm && (
          <Box component="form" id="fill-form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            {fields.map((field) => (
              <Box key={field.id} sx={{ mb: 3 }}>{renderField(field, formData, handleInputChange)}</Box>
            ))}
          </Box>
        )}

        {feedback && <Alert severity={feedback.severity} sx={{ mt: 3 }}>{feedback.message}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting} sx={{backgroundColor: '#f73b200d', color: '#f73b20'}}>Cancel</Button>
        <Button 
          type="submit" 
          form="fill-form" 
          variant="contained" 
          disabled={isSubmitting || !selectedTemplateId || fields.length === 0}
          sx={{ backgroundColor: '#f73b20f0'}}
        >
          {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Form'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};