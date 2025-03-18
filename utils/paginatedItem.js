export default async function getPaginatedItem(type, pagination_amount, page, returnType) {
    try {
        const data = await fetch(`http://${process.env.DB_HOST}:3333/router/${type}/get`, {
            method: "GET"
        });
        const response = await data.json();
        let items = null;

        const pages = Math.ceil(response.length / pagination_amount);
        if (page < 1) {
            page = pages;
        } else if (page > pages) {
            page = 1;
        }

        switch (type) {
            case 'gif':
                items = response.filter(gif => gif.gif_id > ((page - 1) * pagination_amount) && gif.gif_id <= (page * pagination_amount)).map(gif => gif.gif_id + ': ' + gif.data);
                break;
            case 'quote':
                items = response.filter(quote => quote.quote_id > ((page - 1) * pagination_amount) && quote.quote_id <= (page * pagination_amount)).map(quote => `${quote.quote_id}: ${quote.data} - ${quote.quoted}.\nBy **${quote.user}** playing **${quote.game}** at **${formatDate(quote.date)}**\n`);
                break;
            case 'fact':
                items = response.filter(fact => fact.fact_id > ((page - 1) * pagination_amount) && fact.fact_id <= (page * pagination_amount)).map(fact => fact.fact_id + ': ' + fact.data);
                break;
        }

        if (items.length === 0) {
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    content: `No ${type}s found for the given page.`,
                },
            });
        }

        return res.send({
            type: returnType,
            data: {
                content: `${items.join('\n')}\n\n Page ${page} of ${pages}`,
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                label: "<<-",
                                style: 1,
                                custom_id: `back2_${type}_${page}`,
                            },
                            {
                                type: 2,
                                label: "<--",
                                style: 1,
                                custom_id: `back1_${type}_${page}`,
                            },
                            {
                                type: 2,
                                label: "-->",
                                style: 1,
                                custom_id: `next1_${type}_${page}`,
                            },
                            {
                                type: 2,
                                label: "->>",
                                style: 1,
                                custom_id: `next2_${type}_${page}`,
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