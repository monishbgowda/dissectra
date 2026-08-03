import AsyncStorage from "@react-native-async-storage/async-storage";
import { setApiBaseUrl } from "../services/apiClient";

let API = "";

export async function setApi(ip: string) {

    console.log("SETTING API");

    console.log(ip);

    const url = `http://${ip}:4000/api`;

    console.log(url);

    setApiBaseUrl(url);

}

export function getApi() {

    return API;

}