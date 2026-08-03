import { setApi } from "../config/backend";

const DISCOVERY_PORT = 4000;

// Per-host timeout so a dead candidate doesn't stall discovery for
// the default (long) fetch timeout before we move to the next one.
const REQUEST_TIMEOUT_MS = 4000;

interface DiscoveryResult {
    ip?: string;
    port?: number | string;
}

async function tryHost(host: string) {

    const controller = new AbortController();

    const timer = setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT_MS,
    );

    try {

        const response = await fetch(
            `http://${host}:${DISCOVERY_PORT}/discover`,
            { signal: controller.signal }
        );

        clearTimeout(timer);

        if (!response.ok) {

            return null;

        }

        return (await response.json()) as DiscoveryResult | null;

    }

    catch {

        return null;

    }

    finally {

        clearTimeout(timer);

    }

}

function isLikelyBackend(result: DiscoveryResult | null): result is DiscoveryResult {

    return result !== null
        && typeof result === "object"
        && result.ip !== undefined;

}

export async function discoverBackend() {

    // Candidates checked in order. The first one that returns a valid
    // /discover payload wins.
    const candidates = [
        "localhost", // works when adb reverse tcp:4000 tcp:4000 is active
        "10.199.171.59", // PC's LAN IP (confirmed reachable from the phone)
        "192.168.1.15",
        "10.0.2.2", // Android emulator -> host loopback
    ];

    for (const host of candidates) {

        const result = await tryHost(host);

        if (isLikelyBackend(result)) {

            // IMPORTANT: use the host that actually responded here.
            // The /discover payload's `ip` is the backend's getLocalIp(),
            // which on a multi-adapter PC can be a VPN/virtual adapter
            // address the phone cannot reach. We know `host` works
            // because the fetch above just succeeded.
            console.log("[DISCOVERY] Backend found at:", host);

            await setApi(host);

            return host;

        }

    }

    return null;

}
