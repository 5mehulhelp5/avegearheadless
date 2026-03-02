async function probeAllCms() {
    const query = `{
        cmsPage(identifier: "homepage-new") {
            content
            title
        }
    }`;

    try {
        const response = await fetch('https://2fc1869dd5.nxcli.io/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        const data = await response.json();
        const content = data.data?.cmsPage?.content || '';

        console.log("Identifier: homepage-new");
        console.log("Has Slider/Carousel:", content.includes('data-content-type="slider"') || content.includes('data-content-type="products"'));
        console.log("Has Tabs:", content.includes('data-content-type="tabs"'));
        console.log("Has Video:", content.includes('data-content-type="video"'));

        if (content.includes('data-content-type="products"')) {
            const productBlock = content.match(/<div.*?data-content-type="products".*?>([\s\S]*?)<\/div>/);
            console.log("Sample Product Block:", productBlock ? productBlock[0].substring(0, 500) : "Not found in root");
        }
    } catch (err) {
        console.error(err);
    }
}

probeAllCms();
