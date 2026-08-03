import { setApi } from "../config/backend";

export async function discoverBackend() {

    await setApi();

    return true;

}