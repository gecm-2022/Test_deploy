// api.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Deployment APIs
export const getDeployments = async () => {
  const { data } = await api.get("/deployments");
  return data;
};

export const getDeployment = async (id) => {
  const { data } = await api.get(`/deployments/${id}`);
  return data;
};

export const createDeployment = async (payload) => {
  const  data  = await api.post("/deploy", payload);
  return data;
};

export const deleteDeployment = async (id) => {
  await api.delete(`/deployments/${id}`);
};
