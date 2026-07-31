import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:4000", 
    timeout: 60000,
});

api.interceptors.request.use(config => {
    console.log(
        `${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
    );
    return config;
});

export default api;