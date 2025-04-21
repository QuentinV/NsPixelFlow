import React from 'react';
import './style.css';
import { useUnit } from 'effector-react';
import { $project } from '../../state/projects';
import { AudioLoader } from './AudioLoader';

interface DesignerProps {}

export const Designer: React.FC<DesignerProps> = ({}) => {
    const project = useUnit($project);

    return (
        <div className="designer">
            <div>Duration</div>
            <div>Animations</div>
            <div>
                <h3>Audio</h3>
                <div>
                    <AudioLoader />
                </div>
            </div>
        </div>
    );
};
