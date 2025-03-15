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
  description: 'Get a random Melton GIF',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
}

const ALL_COMMANDS = [REACT, QUOTE, LINKTREE, FACT, GIF];

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
      description: "The fact. Don't write 'Did you know!' as it is automatically appended.",
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

const QUOTE_DEBUG = {
  name: 'quote-debug',
  description: 'Debug Quotes',
  options: [
    {
      name: "pagination",
      description: "Ranges in 25s.",
      type: 3,
      required: true
    }
  ]
}

const FACT_DEBUG = {
  name: 'fact-debug',
  description: 'Debug Facts',
  options: [
    {
      name: "pagination",
      description: "Ranges in 25s.",
      type: 3,
      required: true
    }
  ]
}

const GIF_DEBUG = {
  name: 'gif-debug',
  description: 'Debug Gifs',
  options: [
    {
      name: "pagination",
      description: "Ranges in 25s.",
      type: 3,
      required: true
    }
  ]
}

const ALL_PRIVATE_COMMANDS = [QUOTE_ADD, FACT_ADD, GIF_ADD, QUOTE_DEBUG, FACT_DEBUG, GIF_DEBUG];

InstallGuildCommands(process.env.APP_ID, process.env.PRIVATE_GUILD_ID, ALL_PRIVATE_COMMANDS);