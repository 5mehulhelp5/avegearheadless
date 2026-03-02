async function probeCmsFields() {
    const query = `{
        __type(name: "CmsPage") {
            fields {
                name
                type {
                    name
                    kind
                    ofType {
                        name
                        kind
                    }
                }
            }
        }
    }`;

    try {
        const response = await fetch('https://2fc1869dd5.nxcli.io/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(err);
    }
}

probeCmsFields();
