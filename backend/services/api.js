import axios from "axios";

const api = axios.create({

    baseURL:

        process.env.EXPO_PUBLIC_API_URL ||

        "http://10.63.2.59:4000",

    timeout: 60000

});

api.interceptors.request.use(config => {

    console.log(

        `${config.method?.toUpperCase()} ${config.baseURL}${config.url}`

    );

    return config;

});

export default api;