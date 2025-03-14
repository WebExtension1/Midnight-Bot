import 'dotenv/config';
import { InstallGlobalCommands, InstallGuildCommands } from './utils.js';

const REACT = {
  name: 'react',
  description: 'What does Midnight think about this?!',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

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

const LINKTREE = {
  name: 'linktree',
  description: 'Get a link to BigLadMeltons linktree.',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
}

const FACT = {
  name: 'fact',
  description: 'Did you know?',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
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

const TEST = {
  name: 'test',
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

const ALL_PRIVATE_COMMANDS = [TEST];

InstallGuildCommands(process.env.APP_ID, process.env.GUILD_ID, ALL_PRIVATE_COMMANDS);