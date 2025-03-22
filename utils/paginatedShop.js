export default async function getPaginatedShop(res, page, returnType) {
    try {
        let data = await fetch(`http://${process.env.DB_HOST}:3333/router/groups/count`, {
            method: "GET"
        });
        let response = await data.json();
        
        const pages = response[0].pages;
        if (page < 1) {
            page = pages;
        } else if (page > pages) {
            page = 1;
        }

        data = await fetch(`http://${process.env.DB_HOST}:3333/router/groups/get`, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ page })
        });
        response = await data.json();

        if (response.length < 1) {
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `No packs found for the given page.`,
                },
            });
        }

        const details = response.map(pack => `### ${pack.packName}\n${pack.description}`);

        return res.send({
            type: returnType,
            data: {
                embeds: [
                    {
                        title: `${response[0].groupName} Shop`,
                        description: `
## Prices (Midnight Treats)
Common - 10
Uncommon - 18
Rare - 31
Epic - 52
Legendary - 86
Deluxe - 141

## Cards
${details.join('\n')}
                        `,
                        color: 0x0099ff,
                        fields: [
                            { name: "Page", value: `${page} of ${pages}`, inline: true },
                        ],
                    }
                ],
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                label: "<--",
                                style: 1,
                                custom_id: `back_shop_${page}`,
                            },
                            {
                                type: 2,
                                label: "-->",
                                style: 1,
                                custom_id: `next_shop_${page}`,
                            }
                        ]
                    }
                ]
            },
        })
    }
    catch (error) {
        return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                content: `Error: ${error}`,
            },
        });
    }
}