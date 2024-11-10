import {useEffect, useState} from 'react';
import '../App.css';
import Dropzone from './Dropzone';
import {Button, CircularProgress} from '@mui/material';
import Instructions from './Instructions';
import {isFight} from '../models/Fight';
import localforage from 'localforage';
import TopBar from './TopBar';
import {closeSnackbar, SnackbarKey, useSnackbar} from 'notistack';
import FightSelector from './sections/FightSelector';
import {getRaidMetadata} from "../models/Raid";
import { getWavesMetaData, isWaves } from '../models/Waves';
import { Encounter, EncounterMetaData } from '../models/LogLine';
import { FightView } from './FightView';

import ReactGA from 'react-ga4';

const getMetaData = (fight: Encounter): EncounterMetaData => {
    if (isFight(fight)) {
        return fight.metaData;
    } else if (isWaves(fight)) {
        return getWavesMetaData(fight);
    } else {
        return getRaidMetadata(fight);
    }
}


function App() {
    useEffect(() => {
        ReactGA.initialize('G-XL7FZPRS36');
        ReactGA.send({hitType: 'pageview'});
    }, []);

    const fightsStorage = localforage.createInstance({
        name: 'myFightData',
    });

    const {enqueueSnackbar} = useSnackbar();

    const action = (snackbarId: SnackbarKey | undefined) => (
        <>
            <Button
                onClick={() => {
                    closeSnackbar(snackbarId);
                }}
                className="dismiss-button"
            >
                Dismiss
            </Button>
        </>
    );

    const [worker] = useState<Worker>(() => {
        const worker = new Worker(new URL('FileParserWorker.ts', import.meta.url));

        worker.onmessage = (event) => {
            const {type, progress, parseResultMessage, item} = event.data;
            if (type === 'progress') {
                setParsingProgress(progress);
            } else if (type === 'parseResult') {
                if (parseResultMessage.firstResult) {
                    setFightMetadata(parseResultMessage.fightMetadata);
                } else {
                    enqueueSnackbar('No fights found in log file', {variant: 'error', action});
                }

                setParseInProgress(false);
            } else if (type === 'item') {
                item.metaData = getMetaData(item);
                setSelectedFight(item);
            }
        };

        return worker;
    });

    const [fightMetadata, setFightMetadata] = useState<EncounterMetaData[] | null>(null);
    const [selectedFightMetadataIndex, setSelectedFightMetadataIndex] = useState<number | null>(null);
    const [selectedRaidIndex, setSelectedRaidIndex] = useState<number | undefined>(undefined);
    const [selectedFight, setSelectedFight] = useState<Encounter | null>(null);

    const [parseInProgress, setParseInProgress] = useState<boolean>(false);
    const [parsingProgress, setParsingProgress] = useState<number>(0);
    const [loadingStorage, setLoadingStorage] = useState<boolean>(true);

    const handleParse = async (fileContent: string) => {
        setParseInProgress(true);
        worker.postMessage({type: 'parse', fileContent});
    };

    const handleDelete = () => {
        // Delete data from localforage and reset states
        fightsStorage
            .removeItem('fightData')
            .then(() => {
                setSelectedFight(null);
                setFightMetadata(null);
                setLoadingStorage(false);
            })
            .catch((error) => {
                console.error('Error deleting fight data from localforage:', error);
            });
    };

    // raidIndex can be waveIndex
    const handleSelectFight = (index: number, raidIndex?: number, subIndex?: number) => {
        worker.postMessage({type: 'getItem', index, raidIndex, subIndex});
        setSelectedFightMetadataIndex(index);
        setSelectedRaidIndex(raidIndex);
    };

    const handleRaidSelectFight = (raidIndex: number) => {
        worker.postMessage({type: 'getItem', index: selectedFightMetadataIndex, raidIndex});
        setSelectedRaidIndex(raidIndex);
    };

    useEffect(() => {
        // Check if fight data exists in localforage
        fightsStorage
            .getItem<Encounter[]>('fightData')
            .then((data: Encounter[] | null) => {
                if (data) {
                    // recalculate the metadata in case the metadata method has changed since last time it was stored
                    setFightMetadata(data.map(fight =>
                    {
                        const metaData = getMetaData(fight);
                        fight.metaData = metaData;
                        return metaData;   
                    }));
                }
                setLoadingStorage(false);
            })
            .catch((error: any) => {
                console.error('Error getting fight data from localforage:', error);
                setLoadingStorage(false);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="App">
            <div className="App-body">
                <TopBar
                    onDeleteData={handleDelete}
                    showDeleteButton={!loadingStorage && !parseInProgress && (!!selectedFight || !!fightMetadata)}
                />
                {loadingStorage && (
                    <div className="loading-indicator-container">
                        <div className="loading-content">
                            <CircularProgress/>
                        </div>
                    </div>
                )}
                {parseInProgress && (
                    <div className="loading-indicator-container">
                        <div className="loading-content">
                            <p>Parsing logs...</p>
                            <CircularProgress/>
                            <p>{Math.floor(parsingProgress)}%</p>
                        </div>
                    </div>
                )}
                {!loadingStorage && !parseInProgress && !selectedFight && !fightMetadata && (
                    <div>
                        <Instructions/>
                        <Dropzone onParse={handleParse}/>
                    </div>
                )}
                {!loadingStorage && !parseInProgress && !selectedFight && fightMetadata && (
                    <div>
                        <FightSelector fights={fightMetadata!} onSelectFight={handleSelectFight}/>
                    </div>
                )}
                {!loadingStorage && !parseInProgress && selectedFight && (
                    <div>
                        <FightView fight={selectedFight} encounterMetaData={selectedFightMetadataIndex ? fightMetadata?.[selectedFightMetadataIndex] : undefined} onBack={() => setSelectedFight(null)} onSelectFight={handleRaidSelectFight} selectedFightIndex={selectedRaidIndex} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
