async function testToken() {
    const sku = 'Yamaha-YDS11';
    const token = "eyJraWQiOiIxIiwiYWxnIjoiSFMyNTYifQ.eyJ1aWQiOjE3LCJ1dHlwaWQiOjIsImlhdCI6MTc3MjE4NDUxNywiZXhwIjoxNzcyMTg4MTE3fQ._fyLcYWD57lKagZ2jPF0ipqwcOm43bgSl0kLYU41ESc";
    const url = `https://2fc1869dd5.nxcli.io/rest/V1/stockItems/${sku}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        console.log('API Response for Yamaha stock:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Fetch error:', err);
    }
}

testToken();
