import React from 'react';
import { useParams } from 'react-router';

export const EditorPage = () => {
    const { id } = useParams<{ id: string }>();

    return <div>{id}</div>;
};
