import {filterByType, LogLine, LogTypes} from "./models/LogLine";

export function calculateDPS(logLines: LogLine[]): number {
    // Calculate the time difference in seconds
    const timeDiffInSeconds = (logLines[logLines.length - 1].fightTimeMs! - logLines[0].fightTimeMs!) / 1000;

    const filteredLogs = filterByType(logLines, LogTypes.DAMAGE);
    const totalDamage = filteredLogs.reduce(
        (sum, log) => sum + (log.damageAmount),
        0
    );

    const dps = totalDamage / timeDiffInSeconds;

    return dps;
}
