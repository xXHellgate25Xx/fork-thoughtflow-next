import type { ReactNode } from 'react';

export type FormRecord = Record<string, any>;

export interface BaseFieldDef {
    name: string;
    label: string;
    type?: 'text' | 'number' | 'textarea' | 'select' | 'currency' | 'custom' | 'date' | 'datetime' | 'percentage' | 'multiselect' | 'search';
    options?: Record<string, string>;
    rows?: number;
    renderField?: (value: any, onChange: (value: any) => void) => ReactNode;
    renderValue?: (value: any) => ReactNode;
    helperText?: string;
    defaultValue?: any;
    required?: boolean;
    disabled?: boolean;
}

export interface FieldDef<T extends FormRecord = FormRecord> extends Omit<BaseFieldDef, 'name'> {
    name: keyof T;
} 