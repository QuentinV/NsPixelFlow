import React, { useEffect, useRef } from 'react';
import { Project } from '../../api/projects';
import { $project } from '../../state/projects';
import { useUnit } from 'effector-react';
import { rendererManager } from './webgl';

export const Renderer: React.FC = () => {
    const ref = useRef<HTMLDivElement>(null);
    const project = useUnit($project);

    useEffect(() => {
        if (!ref.current) return;
        rendererManager.init(ref.current);
    }, []);

    return <div ref={ref} className="w-full h-full"></div>;
};
