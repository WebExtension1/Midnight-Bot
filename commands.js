import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

// Returns a random emoji
const REACT_COMMAND = {
  name: 'react',
  description: 'What does Midnight think about this?!',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const ALL_COMMANDS = [REACT_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
