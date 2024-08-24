import { SECONDS_PER_TICK } from "./models/Constants";
import {filterByType, LogLine, LogTypes} from "./models/LogLine";

export function calculateDPS(logLines: LogLine[]): number {
    if (logLines.length === 0) {
        return 0;
    }
    // Calculate the time difference in seconds
    const timeDiffInTicks = (logLines[logLines.length - 1].tick! - logLines[0].tick!);
    const timeDiffInSeconds = timeDiffInTicks * SECONDS_PER_TICK;

    const filteredLogs = filterByType(logLines, LogTypes.DAMAGE);
    const totalDamage = filteredLogs.reduce(
        (sum, log) => sum + (log.damageAmount),
        0
    );

    const dps = totalDamage / timeDiffInSeconds;

    return dps;
}
