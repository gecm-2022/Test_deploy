import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export const getDeployments = async () => {
  const response = await axios.get(`${API_URL}/deployments`);
  return response.data;
};

export const getDeployment = async (id) => {
  const response = await axios.get(`${API_URL}/deployments/${id}`);
  return response.data;
};

export const createDeployment = async (data) => {
  const response = await axios.post(`${API_URL}/deployments`, data);
  return response.data;
};

export const deleteDeployment = async (id) => {
  await axios.delete(`${API_URL}/deployments/${id}`);
};