import {Fight, FightMetaData} from "./Fight";
import {Encounter} from "./LogLine";

export interface Waves {
    name: string;
    waves: Wave[];
    metaData: WavesMetaData;
}

export interface Wave {
    name: string;
    fights: Fight[];
    metaData: WaveMetaData;
}

export function isWaves(e: Encounter): e is Waves {
    return (e as Waves).waves !== undefined;
}

export interface WavesMetaData {
    name: string;
    // TODO rename to durationMs
    fightLengthMs: number;
    waves: WaveMetaData[];
}

export interface WaveMetaData {
    name: string;
    fights: FightMetaData[];
    waveLengthTicks: number;
    success: boolean;
}

export function isWaveMetaData(metaData: FightMetaData | WavesMetaData | null): metaData is WavesMetaData {
    if(metaData === null) {
        return false;
    } else {
        return (metaData as WavesMetaData).waves !== undefined;
    }
}

export function getWaveMetaData(wave: Wave): WaveMetaData {
    return {
        ...wave.metaData,
        fights: wave.fights.map(fight => fight.metaData),
    }
}

export function getWavesMetaData(waves: Omit<Waves, 'metaData'>): WavesMetaData {
    return {
        name: waves.name,
        waves: waves.waves.map(getWaveMetaData) ?? [],
        fightLengthMs: waves.waves.reduce((acc, wave) => acc + wave.fights.reduce((acc2, f) => acc2 + f.metaData.fightLengthMs, 0), 0),
    };
}
