const TOKEN = "vwsnxlj8fpeomwioxp7x0zqhqtlxt2q3";
const BASE_URL = "https://2fc1869dd5.nxcli.io";

async function testToken() {
    const sku = "polk-s35-rc65i_rc85i";
    const url = `${BASE_URL}/rest/V1/inventory/get-product-salable-quantity/${sku}/1`;

    console.log(`Testing URL: ${url}`);
    try {
        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        console.log(`Status: ${res.status}`);
        const text = await res.text();
        console.log(`Body: ${text}`);
    } catch (err) {
        console.error("Fetch failed:", err);
    }
}

testToken();
