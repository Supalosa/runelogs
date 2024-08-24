import { Fight } from "./Fight";
import { DamageLog, LogLine, LogTypes } from "./LogLine";

export type Filter = {
    target: string | number | null;
};

export const DEFAULT_LOG_FILTER: Filter = {target: null};

const targetFilter = (filter: Filter) => (l: LogLine) => l.type !== LogTypes.DAMAGE || (l.target.name === filter.target || l.target.id === filter.target);

export const applyFilter = (logLines: LogLine[], filter: Filter): LogLine[] => {
    if (filter.target !== null) {
        return logLines.filter(targetFilter(filter));
    }
    return logLines;
}

export const applyNotFilter = (logLines: LogLine[], filter: Filter): LogLine[] => {
    if (filter.target !== null) {
        return logLines.filter((l) => !targetFilter(filter)(l));
    }
    return logLines;
}

export const applyFightFilter = (fights: Fight[], filter: Filter): Fight[] => {
    if (filter.target !== null) {
        return fights.filter((f) => f.mainEnemyName === filter.target);
    }
    return fights;
}