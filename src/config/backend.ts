import { setApiBaseUrl } from "../services/apiClient";

const API =
    "https://dissectra-production.up.railway.app/api";

export async function setApi() {

    console.log("Using Railway Backend");

    console.log(API);

    setApiBaseUrl(API);

}

export function getApi() {

    return API;

}