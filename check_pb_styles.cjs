async function checkStyles() {
    const query = `{
        cmsPage(identifier: "homepage-new") {
            content
        }
    }`;

    try {
        const response = await fetch('https://2fc1869dd5.nxcli.io/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        const data = await response.json();
        const content = data.data.cmsPage.content;

        console.log("Has <style> tag:", content.includes("<style"));
        if (content.includes("<style")) {
            const match = content.match(/<style.*?>([\s\S]*?)<\/style>/);
            if (match) {
                console.log("Sample Style Content:", match[1].substring(0, 500));
            }
        }
    } catch (err) {
        console.error(err);
    }
}

checkStyles();
