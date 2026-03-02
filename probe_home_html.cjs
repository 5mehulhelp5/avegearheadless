async function probeHomeHtml() {
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
        console.log(data.data.cmsPage.content);
    } catch (err) {
        console.error(err);
    }
}

probeHomeHtml();
