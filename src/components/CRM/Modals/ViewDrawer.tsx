import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';

import {
    alpha,
    Box,
    Button,
    Chip,
    Drawer,
    IconButton,
    Typography,
    useTheme
} from '@mui/material';

import { Iconify } from '../../iconify';

export type FormRecord = Record<string, any>;

// Field definition type
export interface FieldDef {
    name: string;
    label: string;
    type?: 'text' | 'number' | 'select' | 'textarea' | 'multiselect' | 'date' | 'datetime' | 'currency' | 'custom';
    options?: Array<{
        value: string | number | boolean;
        label: string;
    }>;
    defaultValue?: any;
    required?: boolean;
    helperText?: string;
    renderField?: (value: any, onChange: (value: any) => void) => ReactNode;
    renderValue?: (value: any) => ReactNode;
    rows?: number;
}

// Drawer props type
export interface ViewDrawerProps {
    open: boolean;
    onClose: () => void;
    title?: string | ReactNode;
    record?: FormRecord | null;
    fields?: FieldDef[];
    width?: number | string;
    customActions?: ReactNode;
    customContent?: ReactNode;
}

export default function ViewDrawer({
    open,
    onClose,
    title,
    record,
    fields,
    width = 450,
    customActions,
    customContent,
}: ViewDrawerProps) {
    const theme = useTheme();
    const drawerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (open) {
            // When drawer opens, focus the first focusable element
            const focusableElements = drawerRef.current?.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements && focusableElements.length > 0) {
                (focusableElements[0] as HTMLElement).focus();
            }
        }
    }, [open]);

    if (!record) return null;

    const handleClose = () => {
        // Before closing, move focus back to the trigger element
        const triggerElement = document.querySelector('[data-drawer-trigger]') as HTMLElement;
        if (triggerElement) {
            triggerElement.focus();
        }
        onClose();
    };

    // Get a field value based on priority order
    const getFieldValue = (field: FieldDef): any => {
        // If record has this field, use it
        if (record[field.name] !== undefined) {
            return record[field.name];
        }

        // Fall back to default value or empty string
        return field.defaultValue || '';
    };

    // Format currency values
    const formatCurrency = (value?: number) => {
        if (value === undefined || value === null) return '-';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={handleClose}
            hideBackdrop
            disableScrollLock
            ModalProps={{
                sx: {
                    pointerEvents: 'none',
                    '& .MuiDialog-container': {
                        pointerEvents: 'none'
                    },
                    '& .MuiPaper-root': {
                        pointerEvents: 'auto'
                    }
                }
            }}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: width },
                    maxWidth: '100%',
                    borderTopLeftRadius: 8,
                    borderBottomLeftRadius: 8,
                    boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.08)',
                    background: '#FFFFFF',
                    borderLeft: '1px solid rgba(0, 0, 0, 0.08)',
                    transition: theme.transitions.create(['width', 'box-shadow'], {
                        duration: theme.transitions.duration.shorter,
                        easing: theme.transitions.easing.easeInOut,
                    }),
                },
            }}
        >
            <Box
                ref={drawerRef}
                sx={{
                    p: title ? 3 : '24px 28px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: '#FFFFFF',
                }}
            >
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={3}
                    sx={{
                        pb: 2,
                        borderBottom: title ? `1px solid ${alpha(theme.palette.divider, 0.5)}` : 'none',
                        display: title ? 'flex' : 'none',
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                        }}
                    >
                        {title || 'View Record'}
                    </Typography>
                    <IconButton
                        onClick={handleClose}
                        aria-label="close"
                        sx={{
                            color: theme.palette.text.secondary,
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                color: theme.palette.primary.main,
                            },
                            transition: theme.transitions.create(['background-color', 'color'], {
                                duration: theme.transitions.duration.shorter,
                            }),
                        }}
                    >
                        <Iconify icon="mdi:close" />
                    </IconButton>
                </Box>

                <Box
                    sx={{
                        flexGrow: 1,
                        overflowY: 'auto',
                        pr: 1,
                        mr: -1,
                        '&::-webkit-scrollbar': {
                            width: '6px',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.2),
                            borderRadius: '6px',
                        },
                        '&:hover::-webkit-scrollbar-thumb': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.3),
                        },
                    }}
                >
                    {
                        customContent
                        ||
                        (
                            fields && record && fields.map((field, index) => (
                                <Box
                                    key={`field-${field.name}-${index}`}
                                    mb={2.5}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        gutterBottom
                                        sx={{
                                            fontWeight: 500,
                                            color: theme.palette.text.secondary,
                                            mb: 0.5,
                                        }}
                                    >
                                        {field.label}
                                        {field.required && (
                                            <Typography
                                                component="span"
                                                sx={{ color: theme.palette.error.main, ml: 0.5 }}
                                            >
                                                *
                                            </Typography>
                                        )}
                                    </Typography>

                                    {field.renderValue ? (
                                        field.renderValue(getFieldValue(field))
                                    ) : field.type === 'textarea' ? (
                                        <Box
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 1,
                                                backgroundColor: alpha(theme.palette.background.default, 0.5),
                                                border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                                                minHeight: (field.rows || 4) * 24,
                                                whiteSpace: 'pre-wrap'
                                            }}
                                        >
                                            {getFieldValue(field) || '-'}
                                        </Box>
                                    ) : field.type === 'select' ? (
                                        <Box
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 1,
                                                backgroundColor: alpha(theme.palette.background.default, 0.5),
                                                border: `1px solid ${alpha(theme.palette.divider, 0.3)}`
                                            }}
                                        >
                                            {field.options?.find(option => option.value === getFieldValue(field))?.label || '-'}
                                        </Box>
                                    ) : field.type === 'multiselect' ? (
                                        <Box
                                            sx={{
                                                p: 1,
                                                borderRadius: 1,
                                                backgroundColor: alpha(theme.palette.background.default, 0.5),
                                                border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                                                display: 'flex',
                                                flexWrap: 'wrap',
                                                gap: 0.5
                                            }}
                                        >
                                            {Array.isArray(getFieldValue(field)) && getFieldValue(field).length > 0
                                                ? getFieldValue(field).map((value: any) => (
                                                    <Chip
                                                        key={value}
                                                        label={field.options?.find(option => option.value === value)?.label || value}
                                                        size="small"
                                                    />
                                                ))
                                                : '-'
                                            }
                                        </Box>
                                    ) : field.type === 'currency' ? (
                                        <Box
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 1,
                                                backgroundColor: alpha(theme.palette.background.default, 0.5),
                                                border: `1px solid ${alpha(theme.palette.divider, 0.3)}`
                                            }}
                                        >
                                            {formatCurrency(getFieldValue(field))}
                                        </Box>
                                    ) : field.type === 'date' || field.type === 'datetime' ? (
                                        <Box
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 1,
                                                backgroundColor: alpha(theme.palette.background.default, 0.5),
                                                border: `1px solid ${alpha(theme.palette.divider, 0.3)}`
                                            }}
                                        >
                                            {getFieldValue(field)
                                                ? new Date(getFieldValue(field)).toLocaleString(
                                                    'en-US',
                                                    field.type === 'date'
                                                        ? { year: 'numeric', month: 'short', day: 'numeric' }
                                                        : { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                                                )
                                                : '-'
                                            }
                                        </Box>
                                    ) : (
                                        <Box
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 1,
                                                backgroundColor: alpha(theme.palette.background.default, 0.5),
                                                border: `1px solid ${alpha(theme.palette.divider, 0.3)}`
                                            }}
                                        >
                                            {getFieldValue(field) || '-'}
                                        </Box>
                                    )}
                                </Box>
                            ))
                        )}
                </Box>

                <Box
                    sx={{
                        display: customContent && !customActions ? 'none' : 'flex',
                        justifyContent: 'flex-end',
                        pt: 2,
                        mt: 3,
                        borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`
                    }}
                >
                    {customActions}

                    {!customContent && (
                        <Button
                            variant="outlined"
                            onClick={handleClose}
                            size="medium"
                            sx={{
                                color: theme.palette.text.primary,
                                borderColor: alpha(theme.palette.divider, 0.8),
                                '&:hover': {
                                    borderColor: theme.palette.divider,
                                    backgroundColor: alpha(theme.palette.action.hover, 0.05),
                                },
                            }}
                        >
                            Close
                        </Button>
                    )}
                </Box>
            </Box>
        </Drawer>
    );
} 