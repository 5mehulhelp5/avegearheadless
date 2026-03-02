// Using Node's built-in global fetch


const username = 'avgearadmin';
const password = 'avgearadmins@2026';
const baseUrl = 'https://2fc1869dd5.nxcli.io';

async function fetchAdminToken() {
    console.log("[TokenFetcher] Requesting new Admin Session Token...");
    const response = await fetch(`${baseUrl}/rest/V1/integration/admin/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
        console.error(`[TokenFetcher] Failed to fetch token. Status: ${response.status}`);
        return null;
    }
    return await response.json();
}

async function testDynamicToken() {
    console.log("Starting test...");

    // Test token fetch
    const token = await fetchAdminToken();
    if (!token) {
        console.error("FAILED to generate token.");
        return;
    }

    console.log(`Successfully acquired token: ${token.substring(0, 10)}...`);

    // Test stock API with this token
    const sku = "polk-s35-rc65i_rc85i";
    console.log(`\nTesting Stock API for SKU: ${sku}`);
    const url = `https://2fc1869dd5.nxcli.io/rest/V1/inventory/get-product-salable-quantity/${sku}/1`;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    try {
        const res = await fetch(url, { headers });
        console.log(`Status: ${res.status}`);
        const text = await res.text();
        console.log(`Body: ${text}`);
    } catch (err) {
        console.error("Fetch failed:", err);
    }
}

testDynamicToken();
