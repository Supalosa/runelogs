import { FightMetaData } from "../../../models/Fight";
import { formatHHmmss } from "../../../utils/utils";

interface FightProps {
    fight: FightMetaData;
    index: number;
    title: string;
    onSelectFight: (index: number) => void;
    isShortest: boolean;
}

export const Fight: React.FC<FightProps> = ({fight, index, title, onSelectFight, isShortest}) => {
    const time = new Date(`2000-01-01T${fight.time}`);

    const formattedTime = time.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    });

    const nameColor = fight.success ? 'rgb(128, 230, 102)' : 'rgb(230, 128, 102)';

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelectFight(index);
    };
    const formattedDuration = formatHHmmss(fight.fightLengthMs, false);

    return (
        <div className="fight-container" onClick={handleClick}>
            <div className="fight-title">
                <div style={{color: nameColor}}>{`${title} (${formattedDuration})`}</div>
            </div>
            <div>{formattedTime}</div>
            {isShortest && (
                <div className="gold-star">&#9733;</div>
            )}
        </div>
    );
};