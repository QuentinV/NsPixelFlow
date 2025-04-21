import React from 'react';
import { RendererSettings } from '../../api/projects';

interface RendererProps {
    settings?: RendererSettings;
}

export const Renderer: React.FC<RendererProps> = ({ settings }) => {
    return <div></div>;
};
