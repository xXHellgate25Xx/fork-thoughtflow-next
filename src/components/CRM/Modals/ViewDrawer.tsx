import { Close as CloseIcon, DragHandle as DragHandleIcon } from '@mui/icons-material';
import {
    alpha,
    Box,
    Button,
    Chip,
    Drawer,
    IconButton,
    Tooltip,
    Typography,
    useTheme
} from '@mui/material';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
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
export interface ViewDrawerProps<T extends FormRecord> {
    open: boolean;
    onClose: () => void;
    title?: string | ReactNode;
    record?: FormRecord | null;
    fields?: FieldDef<T>[];
    width?: number | string;
    customActions?: ReactNode;
    customContent?: ReactNode;
}

export default function ViewDrawer<T extends FormRecord>({
    open,
    onClose,
    title,
    record,
    fields,
    width = 450,
    customActions,
    customContent,
}: ViewDrawerProps<T>) {
    const { width: drawerWidth, handleMouseDown } = useResize(width);
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
    const getFieldValue = (field: FieldDef<T>): any => {
        // If record has this field, use it
        if (record && field.name in record) {
            return record[field.name as keyof typeof record];
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
                    width: { xs: '100%', sm: drawerWidth },
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
            {/* Left resize handle */}
            <Box
                onMouseDown={handleMouseDown}
                sx={{
                    position: 'absolute',
                    left: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    height: '100px',
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

            <Box
                ref={drawerRef}
                sx={{
                    p: title ? 3 : '24px 20px',
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
                        <CloseIcon />
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
                            fields && record && fields.map((field: FieldDef<T>, index: number) => (
                                <Box
                                    key={`field-${String(field.name)}-${index}`}
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
                                            {field.options?.find((option: { value: string | number | boolean; label: string }) => option.value === getFieldValue(field))?.label || '-'}
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
                                                        label={field.options?.find((option: { value: string | number | boolean; label: string }) => option.value === value)?.label || value}
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