import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

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
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
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
