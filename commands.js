import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

// Returns a random emoji
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

const ALL_COMMANDS = [REACT, QUOTE, LINKTREE];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
