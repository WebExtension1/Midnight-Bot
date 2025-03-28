import 'dotenv/config';
import { InstallGlobalCommands, InstallGuildCommands } from './utils.js';

const REACT = {
  name: 'react',
  description: 'What does Midnight think about this?!',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const LINKTREE = {
  name: 'linktree',
  description: 'Get a link to BigLadMeltons linktree.',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
}

const QUOTE = {
  name: 'quote',
  description: 'Get a random quote from the stream.',
  options: [
    {
      name: "id",
      description: "(Optional) ID of the quote.",
      type: 4,
      required: false
    },
    {
      name: "quoted",
      description: "(Optional) Who said the quote.",
      type: 3,
      required: false
    },
    {
      name: "quoted_by",
      description: "(Optional) Who added the quote.",
      type: 3,
      required: false
    },
    {
      name: "game",
      description: "(Optional) The game that was being played.",
      type: 3,
      required: false
    }
  ]
}

const FACT = {
  name: 'fact',
  description: 'Did you know?',
  options: [
    {
      name: "id",
      description: "(Optional) ID of the fact.",
      type: 4,
      required: false
    }
  ]
}

const GIF = {
  name: 'gif',
  description: 'Get a random Melton GIF.',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
}

const STATS = {
  name: 'stats',
  description: 'Get your usage stats.',
  options: [
    {
      name: "server",
      description: "(Optional). True for server stats. False/empty for yours.",
      type: 5,
      required: false
    }
  ]
}

const SHOP = {
  name: 'shop',
  description: "Display the card shop.",
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
}

const CLIP = {
  name: 'clip',
  description: "Get a random clip from Melton's twitch.",
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
}

const DAILY = {
  name: 'daily',
  description: "Claim your daily balance.",
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
}

const BALANCE = {
  name: 'balance',
  description: "Check your Cat Treat balance.",
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
}

const INVENTORY = {
  name: 'inventory',
  description: "Display your unopened packs.",
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
}

const BUY = {
  name: 'buy',
  description: "Buy a pack from the store.",
  options: [
    {
      name: "name",
      description: "Pack name.",
      type: 3,
      required: true
    },
    {
      name: "rarity",
      description: "Pack rarity (defaults to common).",
      type: 3,
      required: false,
      choices: [
        { name: "Common", value: "common" },
        { name: "Uncommon", value: "uncommon" },
        { name: "Rare", value: "rare" },
        { name: "Epic", value: "epic" },
        { name: "Legendary", value: "legendary" },
        { name: "Deluxe", value: "deluxe" }
      ]
    },
    {
      name: "quantity",
      description: "Amount of packs (defaults to 1).",
      type: 3,
      required: false
    }
  ]
}

const ALL_COMMANDS = [REACT, QUOTE, LINKTREE, FACT, GIF, STATS, SHOP, CLIP, DAILY, BALANCE, INVENTORY, BUY];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);

const QUOTE_ADD = {
  name: 'quote-add',
  description: 'Add a new quote.',
  options: [
    {
      name: "data",
      description: "The quote. Don't add quotes and correctly punctuate.",
      type: 3,
      required: true
    },
    {
      name: "quoted",
      description: "Who said the quote.",
      type: 3,
      required: true
    },
    {
      name: "quoted_by",
      description: "Who quoted it.",
      type: 3,
      required: true
    },
    {
      name: "game",
      description: "The game that was being played.",
      type: 3,
      required: true
    }
  ]
}

const FACT_ADD = {
  name: 'fact-add',
  description: 'Add a new fact.',
  options: [
    {
      name: "data",
      description: "The fact.",
      type: 3,
      required: true
    }
  ]
}

const GIF_ADD = {
  name: 'gif-add',
  description: 'Add a new gif.',
  options: [
    {
      name: "data",
      description: "The gif link.",
      type: 3,
      required: true
    }
  ]
}

const CLIP_ADD = {
  name: 'clip-add',
  description: 'Add a new clip.',
  options: [
    {
      name: "data",
      description: "The clip link.",
      type: 3,
      required: true
    }
  ]
}

const REACT_DEBUG = {
  name: 'react-debug',
  description: 'Debug Reacts.',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
}

const QUOTE_DEBUG = {
  name: 'quote-debug',
  description: 'Debug Quotes.',
  options: [
    {
      name: "pagination",
      description: "Page.",
      type: 4,
      required: false
    }
  ]
}

const FACT_DEBUG = {
  name: 'fact-debug',
  description: 'Debug Facts.',
  options: [
    {
      name: "pagination",
      description: "Page.",
      type: 4,
      required: false
    }
  ]
}

const GIF_DEBUG = {
  name: 'gif-debug',
  description: 'Debug Gifs.',
  options: [
    {
      name: "pagination",
      description: "Page.",
      type: 4,
      required: false
    }
  ]
}

const CLIP_DEBUG = {
  name: 'clip-debug',
  description: 'Debug clips.',
  options: [
    {
      name: "pagination",
      description: "Page.",
      type: 4,
      required: false
    }
  ]
}

const QUOTE_UPDATE = {
  name: 'quote-update',
  description: 'Update Quotes.',
  options: [
    {
      name: "id",
      description: "Quote's id.",
      type: 4,
      required: true
    },
    {
      name: "data",
      description: "The quote.",
      type: 3,
      required: false
    },
    {
      name: "quoted",
      description: "Who was quoted.",
      type: 3,
      required: false
    },
    {
      name: "quoted_by",
      description: "Who made the quote.",
      type: 3,
      required: false
    },
    {
      name: "game",
      description: "Quote's data.",
      type: 3,
      required: false
    },
    {
      name: "date",
      description: "Quote's data.",
      type: 3,
      required: false
    }
  ]
}

const FACT_UPDATE = {
  name: 'fact-update',
  description: 'Update Facts.',
  options: [
    {
      name: "id",
      description: "Fact's id.",
      type: 4,
      required: true
    },
    {
      name: "data",
      description: "Fact's data.",
      type: 3,
      required: true
    }
  ]
}

const GIF_UPDATE = {
  name: 'gif-update',
  description: 'Update Gifs.',
  options: [
    {
      name: "id",
      description: "Gif's id.",
      type: 4,
      required: true
    },
    {
      name: "data",
      description: "Gif's data.",
      type: 3,
      required: true
    }
  ]
}

const CLIP_UPDATE = {
  name: 'clip-update',
  description: 'Update Clips.',
  options: [
    {
      name: "id",
      description: "Clip's id.",
      type: 4,
      required: true
    },
    {
      name: "data",
      description: "Clip's data.",
      type: 3,
      required: true
    }
  ]
}

const QUOTE_DELETE = {
  name: 'quote-delete',
  description: 'Delete Quote.',
  options: [
    {
      name: "id",
      description: "Quotes's id.",
      type: 4,
      required: true
    }
  ]
}

const FACT_DELETE = {
  name: 'fact-delete',
  description: 'Delete Fact.',
  options: [
    {
      name: "id",
      description: "Fact's id.",
      type: 4,
      required: true
    }
  ]
}

const GIF_DELETE = {
  name: 'gif-delete',
  description: 'Delete Quote.',
  options: [
    {
      name: "id",
      description: "Gif's id.",
      type: 4,
      required: true
    }
  ]
}

const CLIP_DELETE = {
  name: 'clip-delete',
  description: 'Delete Clip.',
  options: [
    {
      name: "id",
      description: "Clip's id.",
      type: 4,
      required: true
    }
  ]
}

const OPEN = {
  name: 'open',
  description: "Open a pack from your inventory.",
  options: [
    {
      name: "name",
      description: "Pack name.",
      type: 3,
      required: true
    },
    {
      name: "rarity",
      description: "Pack rarity.",
      type: 3,
      required: true
    }
  ]
}

const ALL_PRIVATE_COMMANDS = [QUOTE_ADD, FACT_ADD, GIF_ADD, CLIP_ADD, REACT_DEBUG, QUOTE_DEBUG, FACT_DEBUG, GIF_DEBUG, CLIP_DEBUG, QUOTE_UPDATE, FACT_UPDATE, GIF_UPDATE, CLIP_UPDATE, QUOTE_DELETE, FACT_DELETE, GIF_DELETE, CLIP_DELETE, OPEN];

InstallGuildCommands(process.env.APP_ID, process.env.PRIVATE_GUILD_ID, ALL_PRIVATE_COMMANDS);