import React, {useContext, useEffect, useState} from 'react';
import {calculateDPS} from "../CalculateDPS";
import {Table, TableBody, TableCell, TableContainer, TableRow} from '@mui/material';
import {calculateAccuracy, formatHHmmss} from "../utils/utils";
import {LogLine, LogTypes} from "../models/LogLine";
import { Info } from './Info';
import { FilterContext } from './context/FilterContext';
import { applyFilter } from '../models/Filter';

interface ResultsProps {
    logLines: LogLine[];
    fightLengthMs: number;
}

const Results: React.FC<ResultsProps> = ({logLines, fightLengthMs}) => {
    const logFilter = useContext(FilterContext);
    const [fightDuration, setFightDuration] = useState<string>("");
    const [activeFightDuration, setActiveFightDuration] = useState<string>("");
    const [damage, setDamage] = useState<number>(0);
    const [overallDps, setOverallDps] = useState<number>(0);
    const [activeDps, setActiveDps] = useState<number>(0);
    const [hits, setHits] = useState<number>(0);
    const [accuracy, setAccuracy] = useState<number>(0);

    useEffect(() => {
        // fight duration is based on unfiltered logs
        const firstTick = logLines.reduce((acc, l) => Math.min(acc, l.tick!), Number.MAX_SAFE_INTEGER);
        const lastTick = logLines.reduce((acc, l) => Math.max(acc, l.tick!), 0);
        setFightDuration(formatHHmmss((lastTick - firstTick) * 600, true));

        const filteredLogLines = applyFilter(logLines, logFilter);

        
        setActiveFightDuration(formatHHmmss(fightLengthMs, true));

        const totalDamage = filteredLogLines
            .filter(log => log.type === LogTypes.DAMAGE)
            .reduce((acc, log) => acc + (log as LogLine & { type: LogTypes.DAMAGE }).damageAmount, 0);
        setDamage(totalDamage);

        setOverallDps(calculateDPS(filteredLogLines));
        setActiveDps(totalDamage / (fightLengthMs / 1000));
        setHits(filteredLogLines.length);
        setAccuracy(calculateAccuracy(filteredLogLines));
    }, [logLines, fightLengthMs, logFilter]);

    return (
        <div className="results-container">
            <TableContainer>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell>
                                <strong>Overall Duration</strong>
                            </TableCell>
                            <TableCell>
                                {fightDuration}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <strong>Active Duration</strong>
                            </TableCell>
                            <TableCell>
                                {activeFightDuration}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <strong>Damage</strong>
                            </TableCell>
                            <TableCell>
                                {damage}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <strong>Overall DPS <Info content="DPS including downtime between fights" /></strong>
                            </TableCell>
                            <TableCell>
                                {isNaN(overallDps) || !isFinite(overallDps) ? 'N/A' : overallDps.toFixed(3)}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <strong>Active DPS <Info content="DPS actively fighting things" /></strong>
                            </TableCell>
                            <TableCell>
                                {isNaN(activeDps) || !isFinite(activeDps) ? 'N/A' : activeDps.toFixed(3)}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <strong>Attacks</strong>
                            </TableCell>
                            <TableCell>
                                {hits}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>
                                <strong>Accuracy</strong>
                            </TableCell>
                            <TableCell>
                                {accuracy.toFixed(2)}%
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default Results;
