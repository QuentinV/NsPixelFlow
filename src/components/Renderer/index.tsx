import React, { useEffect, useRef } from 'react';
import { $render } from '../../state/render';
import { useUnit } from 'effector-react';
import { rendererManager } from './webgl';

export const Renderer: React.FC = () => {
    const ref = useRef<HTMLDivElement>(null);
    const settings = useUnit($render);

    useEffect(() => {
        if (!ref.current) return;
        rendererManager.init(ref.current);
    }, []);

    useEffect(() => {
        rendererManager.updateState(settings);
    }, [settings]);

    return <div ref={ref} className="w-full h-full"></div>;
};
