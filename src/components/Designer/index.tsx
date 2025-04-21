import React from 'react';
import './style.css';
import { Project } from '../../api/projects';

interface DesignerProps {
    project: Project;
}

export const Designer: React.FC<DesignerProps> = ({ project }) => {
    return (
        <div className="designer">
            <div>Duration</div>
            <div>Animations</div>
            <div>Audio</div>
        </div>
    );
};
