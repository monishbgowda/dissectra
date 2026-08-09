import axios from "axios";

export const api = axios.create({
    timeout: 120000,
});

export function setApiBaseUrl(url: string) {
    api.defaults.baseURL = url;
}

api.interceptors.request.use(config => {

    console.log("=================================");
    console.log("REQUEST");
    console.log("BASE:", config.baseURL);
    console.log("URL :", config.url);
    console.log("METHOD:", config.method);
    console.log("=================================");

    return config;

});

api.interceptors.response.use(

    response => {

        console.log("RESPONSE", response.status);

        return response;

    },

    error => {

        console.log("========= AXIOS =========");
        console.log(error.message);
        console.log(error.code);
        console.log(error.config?.baseURL);
        console.log(error.config?.url);
        console.log(error.response?.status);
        console.log(error.response?.data);
        console.log("=========================");

        return Promise.reject(error);

    }

);