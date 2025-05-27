import { Close as CloseIcon, DragHandle as DragHandleIcon } from '@mui/icons-material';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Tooltip,
    useTheme
} from '@mui/material';
import { format as formatDate, parseISO } from 'date-fns';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Combobox, ComboboxOption } from 'src/components/ui/combobox';
import type { FieldDef, FormRecord } from './types';

// Custom hook for handling resize
const useResize = (initialWidth: number | string) => {
    const [width, setWidth] = useState(initialWidth);
    const [isResizing, setIsResizing] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startWidth, setStartWidth] = useState(0);
    const [resizeFromLeft, setResizeFromLeft] = useState(false);
    const handleMouseDown = useCallback((e: React.MouseEvent, fromLeft: boolean = false) => {
        setIsResizing(true);
        setStartX(e.clientX);
        setStartWidth(typeof width === 'number' ? width : parseInt(width as string, 10));
        setResizeFromLeft(fromLeft);
    }, [width]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing) return;

        const diff = startX - e.clientX;
        const newWidth = Math.max(400, Math.min(window.innerWidth * 0.9, startWidth + (resizeFromLeft ? -diff : diff)));
        setWidth(newWidth);
    }, [isResizing, startX, startWidth, resizeFromLeft]);

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
        setResizeFromLeft(false);
    }, []);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);

    return { width, handleMouseDown };
};

// Drawer props type
export interface EditDrawerProps<T extends FormRecord> {
    open: boolean;
    onClose: () => void;
    title?: string | ReactNode;
    initialRecord: Partial<T>;
    onSave: (record: Partial<T>) => Promise<void>;
    fields?: FieldDef<T>[];
    width?: number | string;
    customActions?: ReactNode;
    customContent?: ReactNode;
    submitLoading?: boolean;
    hideCloseIcon?: boolean;
    searchOptions?: Record<string, ComboboxOption[]>;
    onFieldChange?: (field: keyof T, value: any, record: Partial<T>) => void;
}

export const EditDrawer = <T extends FormRecord>({
    open,
    onClose,
    title,
    initialRecord,
    onSave,
    fields,
    width = 800,
    customActions,
    customContent,
    submitLoading = false,
    hideCloseIcon = false,
    searchOptions = {},
    onFieldChange,
}: EditDrawerProps<T>) => {
    const [record, setRecord] = useState<Partial<T>>(initialRecord);
    const [errors, setErrors] = useState<Record<keyof T | string, string>>({} as Record<keyof T | string, string>);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { width: drawerWidth, handleMouseDown } = useResize(width);
    const theme = useTheme();

    // Reset form when drawer opens with new record
    useEffect(() => {
        if (open) {
            setRecord(initialRecord);
            setErrors({} as Record<keyof T | string, string>);
        }
    }, [open, initialRecord]);
    useEffect(() => {
        if (!fields) return;
        setRecord(prev => {
            let updated = { ...prev };
            fields.forEach(field => {
                if (field.type === 'search') {
                    const options = searchOptions[field.name as string] || [];
                    const value: string = Array.isArray(prev[field.name]) ? prev[field.name][0] : prev[field.name];
                    // If value is not in new options, set to undefined
                    if (value && !options.some(opt => opt.value === value)) {
                        console.log(field.name, value, options);
                        updated = {
                            ...updated, [field.name]: options[0]?.value ?? undefined
                        }
                    }
                }
            });
            return updated;
        });
    }, [searchOptions]);
    const handleInputChange = (field: keyof T, value: any) => {
        const fieldDef = fields?.find(f => f.name === field);

        // Handle percentage fields
        if (fieldDef?.type === 'percentage') {
            if (value === '' || Number.isNaN(value)) {
                value = null;
            } else {
                value = parseFloat(value) / 100;
            }
        }
        // Format date value if it's a date field
        else if (fieldDef?.type === 'date' && value) {
            value = formatDate(value, 'yyyy-MM-dd');
        }
        // Handle empty values for number fields
        else if (fieldDef?.type === 'number' || fieldDef?.type === 'currency') {
            if (value === '') {
                value = null;
            } else if (!Number.isNaN(Number(value))) {
                value = parseFloat(value);
            }
        }
        setRecord(prev => {
            const updated = {
                ...prev,
                [field]: value
            };
            // Fire callback after state update
            if (onFieldChange) {
                onFieldChange(field, value, updated);
            }
            return updated;
        });
        // Clear error for the changed field
        setErrors(prev => ({
            ...prev,
            [field]: ''
        }));
    };

    const validateForm = () => {
        const newErrors: Record<keyof T, string> = {} as Record<keyof T, string>;

        fields?.forEach(field => {
            if (field.required && !record[field.name]) {
                newErrors[field.name] = `${field.label} is required`;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSave(record);
            onClose();
        } catch (error) {
            console.error('Failed to save:', error);
            setErrors(prev => ({
                ...prev,
                submit: 'Failed to save changes. Please try again.'
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const getFieldValue = (field: FieldDef<T>): any => {
        if (field.type === 'percentage') {
            const value = record[field.name] as number;
            // Handle undefined, null, or NaN values
            if (value === undefined || value === null || Number.isNaN(value)) {
                return '';
            }
            return value * 100;
        }
        if (field.type === 'number' || field.type === 'currency') {
            const value = record[field.name] as number;
            // Handle undefined, null, or NaN values
            if (value === undefined || value === null || Number.isNaN(value)) {
                return '';
            }
            return value;
        }
        if (field.type === 'date') {
            const dateValue = record[field.name];
            if (!dateValue) return '';
            // Parse ISO string if it exists, otherwise use the value directly
            const date = typeof dateValue === 'string' && dateValue.includes('T')
                ? parseISO(dateValue)
                : dateValue;
            return formatDate(date as Date, 'yyyy-MM-dd');
        }
        if (field.type === 'select') {
            // Return the actual value from record if it exists, otherwise return empty string
            return record[field.name] !== undefined ? record[field.name] : '';
        }
        if (field.type === 'search') {
            const value = record[field.name];
            if (Array.isArray(value)) {
                return value[0] || '';
            }
            return value || '';
        }
        if (record[field.name] !== undefined && record[field.name] !== null) {
            return record[field.name];
        }
        return field.defaultValue || '';
    };

    return (
        <Dialog
            key={JSON.stringify(initialRecord)}
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    width: drawerWidth,
                    height: '100%',
                    maxHeight: '100%',
                    position: 'fixed',
                    right: 0,
                    top: 0,
                    m: 0,
                    borderRadius: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    minWidth: 400,
                    maxWidth: '90vw',
                    [theme.breakpoints.down('sm')]: {
                        width: '100%',
                        maxWidth: '100%'
                    }
                }
            }}
        >
            {/* Left resize handle */}
            <Box
                onMouseDown={handleMouseDown}
                sx={{
                    position: 'absolute',
                    left: "5px",
                    top: '50%',
                    transform: 'translateY(-60%)',
                    height: '50px',
                    width: '4px',
                    cursor: 'ew-resize',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    [theme.breakpoints.down('sm')]: {
                        display: 'none'
                    }
                }}
            >
                <Tooltip title="Drag to resize" placement="right">
                    <DragHandleIcon sx={{
                        color: 'text.secondary',
                        opacity: 0.5,
                        rotate: '90deg',
                        '&:hover': { opacity: 1 }
                    }} />
                </Tooltip>
            </Box>

            <DialogTitle
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pb: 2,
                    borderBottom: 1,
                    borderColor: 'divider',
                    pt: 2,
                    userSelect: 'none',
                    position: 'relative'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 500 }}>{title || 'Edit Record'}</div>
                </Box>
                {!hideCloseIcon && (
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                )}
            </DialogTitle>

            <DialogContent sx={{
                py: 3,
                mt: 2,
                '&.MuiDialogContent-root': {
                    padding: '24px',
                    overflow: 'auto'
                }
            }}>
                {customContent || (
                    fields && record && (
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: 3
                        }}>
                            {fields.map((field, index) => (
                                <Box
                                    key={field.name as string}
                                    sx={{
                                        animation: `fadeIn ${0.3 + index * 0.05}s ease-in-out`
                                    }}
                                >
                                    {field.renderField ? (
                                        field.renderField(getFieldValue(field), (value) => handleInputChange(field.name, value))
                                    ) : field.type === 'textarea' ? (
                                        <>
                                            <TextField
                                                fullWidth
                                                label={field.label}
                                                value={getFieldValue(field)}
                                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                multiline
                                                disabled={field.disabled}
                                                rows={field.rows || 4}
                                                variant="outlined"
                                                error={!!errors[field.name]}
                                            />
                                            {(errors[field.name] || field.helperText) && (
                                                <div
                                                    className={
                                                        errors[field.name]
                                                            ? 'text-xs font-light text-red-600 mt-2 block'
                                                            : 'text-xs font-light text-gray-500 mt-2 block'
                                                    }
                                                >
                                                    {errors[field.name] || field.helperText}
                                                </div>
                                            )}
                                        </>
                                    ) : field.type === 'select' ? (
                                        <>
                                            <FormControl fullWidth variant="outlined" disabled={field.disabled} error={!!errors[field.name]}>
                                                <InputLabel>{field.label}</InputLabel>
                                                <Select
                                                    value={String(getFieldValue(field) || '')}
                                                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                    label={field.label}
                                                >
                                                    {
                                                        field.options && Object.entries(field.options).map(([value, label]) => (
                                                            <MenuItem key={value} value={value}>
                                                                {label}
                                                            </MenuItem>
                                                        ))
                                                    }
                                                </Select>
                                            </FormControl>
                                            {(errors[field.name] || field.helperText) && (
                                                <div
                                                    className={
                                                        errors[field.name]
                                                            ? 'text-xs font-light text-red-600 mt-2 block'
                                                            : 'text-xs font-light text-gray-500 mt-2 block'
                                                    }
                                                >
                                                    {errors[field.name] || field.helperText}
                                                </div>
                                            )}
                                        </>
                                    ) : field.type === 'number' || field.type === 'currency' || field.type === 'percentage' ? (
                                        <>
                                            <TextField
                                                fullWidth
                                                disabled={field.disabled}
                                                label={field.label}
                                                type="number"
                                                value={getFieldValue(field)}
                                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                onWheel={(e) => e.currentTarget.getElementsByTagName('input')[0]?.blur()}
                                                variant="outlined"
                                                error={!!errors[field.name]}
                                                InputProps={field.type === 'currency' ? {
                                                    startAdornment: <span style={{ marginRight: 8 }}>$</span>
                                                } : field.type === 'percentage' ? {
                                                    endAdornment: <span style={{ marginLeft: 8 }}>%</span>
                                                } : undefined}
                                            />
                                            {(errors[field.name] || field.helperText) && (
                                                <div
                                                    className={
                                                        errors[field.name]
                                                            ? 'text-xs font-light text-red-600 mt-2 block'
                                                            : 'text-xs font-light text-gray-500 mt-2 block'
                                                    }
                                                >
                                                    {errors[field.name] || field.helperText}
                                                </div>
                                            )}
                                        </>
                                    ) : field.type === 'date' ? (
                                        <>
                                            <TextField
                                                fullWidth
                                                disabled={field.disabled}
                                                label={field.label}
                                                type="date"
                                                value={getFieldValue(field)}
                                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                variant="outlined"
                                                error={!!errors[field.name]}
                                            />
                                            {(errors[field.name] || field.helperText) && (
                                                <div
                                                    className={
                                                        errors[field.name]
                                                            ? 'text-xs font-light text-red-600 mt-2 block'
                                                            : 'text-xs font-light text-gray-500 mt-2 block'
                                                    }
                                                >
                                                    {errors[field.name] || field.helperText}
                                                </div>
                                            )}
                                        </>
                                    ) : field.type === 'search' ? (
                                        <>
                                            <div style={{ marginBottom: 4, marginLeft: 2, fontSize: '0.85rem', fontWeight: 400, color: theme.palette.text.secondary }}>
                                                {field.label}
                                            </div>
                                            <Combobox
                                                options={searchOptions[field.name as string] as ComboboxOption[] || []}
                                                value={getFieldValue(field)}
                                                onChange={val => handleInputChange(field.name, val)}
                                                placeholder={field.label}
                                                width="100%"
                                                disabled={field.disabled}
                                            />
                                            {(errors[field.name] || field.helperText) && (
                                                <div
                                                    className={
                                                        errors[field.name]
                                                            ? 'text-xs font-light text-red-600 mt-2 block'
                                                            : 'text-xs font-light text-gray-500 mt-2 block'
                                                    }
                                                >
                                                    {errors[field.name] || field.helperText}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <TextField
                                                fullWidth
                                                disabled={field.disabled}
                                                label={field.label}
                                                value={String(getFieldValue(field) || '')}
                                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                variant="outlined"
                                                error={!!errors[field.name]}
                                            />
                                            {(errors[field.name] || field.helperText) && (
                                                <div
                                                    className={
                                                        errors[field.name]
                                                            ? 'text-xs font-light text-red-600 mt-2 block'
                                                            : 'text-xs font-light text-gray-500 mt-2 block'
                                                    }
                                                >
                                                    {errors[field.name] || field.helperText}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </Box>
                            ))}
                        </Box>
                    )
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                {customActions || (
                    <>
                        <Button
                            variant="outlined"
                            onClick={onClose}
                            disabled={submitLoading || isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={submitLoading || isSubmitting}
                        >
                            Save Changes
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
} 