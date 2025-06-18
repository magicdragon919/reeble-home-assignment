import axios, { AxiosResponse } from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL;

export const uploadPDF = async (formData: FormData): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await axios.post(`${VITE_API_URL}/upload_pdf/`, formData, {
      headers: {
        "Content-Type": 'multipart/form-data',
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error uploading PDF", error);
    throw new Error("Unable to upload PDF");
  }
}