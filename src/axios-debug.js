import axios from "axios";
import debug from "debug";

const axiosDebug = debug("axios");

axios.interceptors.request.use((request) => {
  axiosDebug(`📡 Request: ${request.method.toUpperCase()} ${request.url}`);
  return request;
});

axios.interceptors.response.use((response) => {
  axiosDebug(`📩 Response: ${response.status} ${response.statusText}`);
  return response;
});
