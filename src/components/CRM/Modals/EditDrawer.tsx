import { Close as CloseIcon } from '@mui/icons-material';
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
    Typography
} from '@mui/material';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

// Field definition type
export interface FieldDef<T extends Record<string, any>> {
    name: keyof T;
    label: string;
    type?: 'text' | 'number' | 'textarea' | 'select' | 'currency' | 'custom';
    options?: { value: string; label: string }[];
    rows?: number;
    renderField?: (value: any, onChange: (value: any) => void) => ReactNode;
    helperText?: string;
    defaultValue?: any;
    required?: boolean;
    disabled?: boolean;
}

// Drawer props type
export interface EditDrawerProps<T extends Record<string, any>> {
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
}

export default function EditDrawer<T extends Record<string, any>>({
    open,
    onClose,
    title,
    initialRecord,
    onSave,
    fields,
    width = 450,
    customActions,
    customContent,
    submitLoading = false,
}: EditDrawerProps<T>) {
    const [record, setRecord] = useState<Partial<T>>(initialRecord);
    const [errors, setErrors] = useState<Record<keyof T | string, string>>({} as Record<keyof T | string, string>);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Reset form when drawer opens with new record
    useEffect(() => {
        if (open) {
            setRecord(initialRecord);
            setErrors({} as Record<keyof T | string, string>);
        }
    }, [open, initialRecord]);

    const handleInputChange = (field: keyof T, value: any) => {
        setRecord(prev => ({
            ...prev,
            [field]: value
        }));
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
        if (record[field.name] !== undefined) {
            return record[field.name];
        }
        if (field.type === 'select' && field.options && field.options.length > 0) {
            return field.defaultValue || field.options[0].value;
        }
        return field.defaultValue || '';
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    width,
                    height: '100%',
                    maxHeight: '100%',
                    position: 'fixed',
                    right: 0,
                    top: 0,
                    m: 0,
                    borderRadius: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                pb: 2,
                borderBottom: 1,
                borderColor: 'divider',
                pt: 2
            }}>
                <Typography variant="h6">{title || 'Edit Record'}</Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{
                py: 3,
                mt: 1,
                '&.MuiDialogContent-root': {
                    padding: '24px',
                    overflow: 'auto'
                }
            }}>
                {customContent || (
                    fields && record && (
                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
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
                                        <TextField
                                            fullWidth
                                            label={field.label}
                                            value={getFieldValue(field)}
                                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                                            multiline
                                            rows={field.rows || 4}
                                            variant="outlined"
                                            error={!!errors[field.name]}
                                            helperText={errors[field.name] || field.helperText}
                                        />
                                    ) : field.type === 'select' ? (
                                        <FormControl fullWidth variant="outlined">
                                            <InputLabel>{field.label}</InputLabel>
                                            <Select
                                                value={String(getFieldValue(field) || '')}
                                                onChange={(e) => handleInputChange(field.name, e.target.value)}
                                                label={field.label}
                                                error={!!errors[field.name]}
                                            >
                                                {field.options?.map((option) => (
                                                    <MenuItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {(errors[field.name] || field.helperText) && (
                                                <Typography variant="caption" color={errors[field.name] ? "error" : "textSecondary"} sx={{ mt: 1 }}>
                                                    {errors[field.name] || field.helperText}
                                                </Typography>
                                            )}
                                        </FormControl>
                                    ) : field.type === 'number' || field.type === 'currency' ? (
                                        <TextField
                                            fullWidth
                                            label={field.label}
                                            type="number"
                                            value={getFieldValue(field)}
                                            onChange={(e) => handleInputChange(field.name, parseFloat(e.target.value))}
                                            variant="outlined"
                                            error={!!errors[field.name]}
                                            helperText={errors[field.name] || field.helperText}
                                            InputProps={field.type === 'currency' ? {
                                                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                                            } : undefined}
                                        />
                                    ) : (
                                        <TextField
                                            fullWidth
                                            label={field.label}
                                            value={String(getFieldValue(field) || '')}
                                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                                            variant="outlined"
                                            error={!!errors[field.name]}
                                            helperText={errors[field.name] || field.helperText}
                                        />
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