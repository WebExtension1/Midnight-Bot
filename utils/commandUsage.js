const usageFile = process.env.USAGE_FILE;

export default function trackCommandUsage(userId, commandName, commandStats) {
    if (!commandStats[userId]) {
        commandStats[userId] = {};
    }

    if (!commandStats[userId][commandName]) {
        commandStats[userId][commandName] = 0;
    }
    commandStats[userId][commandName]++;

    fs.writeFileSync(usageFile, JSON.stringify(commandStats), 'utf8');
}

export default function getCommandUsageDetails() {
    return JSON.parse(fs.readFileSync(usageFile, 'utf8'));
}