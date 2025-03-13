import 'dotenv/config';

export async function DiscordRequest(endpoint, options) {
  // append endpoint to root API URL
  const url = 'https://discord.com/api/v10/' + endpoint;
  // Stringify payloads
  if (options.body) options.body = JSON.stringify(options.body);
  // Use fetch to make requests
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent': 'DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)',
    },
    ...options
  });
  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  // return original response
  return res;
}

export async function InstallGlobalCommands(appId, commands) {
  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;

  try {
    // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    await DiscordRequest(endpoint, { method: 'PUT', body: commands });
  } catch (err) {
    console.error(err);
  }
}

// Simple method that returns a random emoji from list
export function getRandomEmoji() {
  const emojiList = [
    '<:AbsoluteCinema:1333544033376796694>',
    '<:AutismCreature:1348763091772506182>',
    '<:AirFryer:1348762989712642160>',
    '<:LIVEBIGLADMELTONREACTION:1348763088882761850>',
    '<:LiveKeltonReaction:1348763093294907493>',
    '<:MeltonApproved:1348746365462642710>',
    '<:MeltonGuitar:1348762983374913687>',
    '<:MeltonKiss:1348763087687127072>',
    '<:MeltonMasterpiece:1348762981399531531>',
    '<:MeltonMiddleFinger:1348762995479806117>',
    '<:MeltonPanic:1348762977632784509>',
    '<:MeltonPoint:1348762985295773727>',
    '<:MeltonPray:1348762986977951834>',
    '<:MeltonSad:1348762992681947240>',
    '<:MeltonStare:1348763033588994161>',
    '<:MeltonStop:1348762980069937232>',
    '<:MeltonThumbsDown:1348763001985040449>',
    '<:MeltonThumbsUp:1348763003939717140>',
    '<:MeltonUnapproved:1348746367492689980>',
    '<:MidnightConcern:1348762978752925706>',
    '<:MidnightScream:1348762988596822036>',
    '<:MorbinTime:1348763090270818355>',
    '<:Wizard:1175826895716229201>',
  ];
  return emojiList[Math.floor(Math.random() * emojiList.length)];
}

export function getRandomQuote() {
  // This should be replaced by an API eventually
  const quoteList = [
    `Fuck you Web`,
    `"I like.. Watched seagulls" - Kelton`,
    `"I kinda just don't think stuff" - Melton`,
    `"Nobody has ever told me what my eye colours are, but I think they're brown" - Kelton`
  ]
  return quoteList[Math.floor(Math.random() * quoteList.length)];
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
