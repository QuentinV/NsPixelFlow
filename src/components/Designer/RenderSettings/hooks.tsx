import { ReactNode } from 'react';
import { InputSwitch } from 'primereact/inputswitch';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';

interface SettingsState {
    settings?: any;
}

export const useForm = <T extends SettingsState>(
    state: T,
    setState: (state: T) => void
) => {
    const changeState = (event: any, key: string) => {
        const value = event.target?.value ?? event.value;
        setState({
            ...state,
            settings: {
                ...(state?.settings ?? {}),
                [key]: value,
            },
        });
    };

    const renderField = ({
        key,
        label,
        render,
    }: {
        key: string;
        label: string;
        render: ({ value, onChange }: any) => ReactNode;
    }) => (
        <div className="flex gap-2 align-items-center">
            <label>{label}</label>
            {render({
                value: (state?.settings as any)?.[key],
                onChange: (event: any) => changeState(event, key),
            })}
        </div>
    );

    const renderBoolean = ({ key, label }: { key: string; label: string }) =>
        renderField({
            key,
            label,
            render: ({ value, onChange }) => (
                <InputSwitch checked={value} onChange={onChange} />
            ),
        });

    const renderNumber = ({ key, label }: { key: string; label: string }) =>
        renderField({
            key,
            label,
            render: ({ value, onChange }) => (
                <InputNumber value={value} onChange={onChange} />
            ),
        });

    const renderString = ({ key, label }: { key: string; label: string }) =>
        renderField({
            key,
            label,
            render: ({ value, onChange }) => (
                <InputText
                    value={value}
                    onChange={onChange}
                    className="input-sm"
                />
            ),
        });

    return {
        changeState,
        renderField,
        renderBoolean,
        renderNumber,
        renderString,
    };
};
