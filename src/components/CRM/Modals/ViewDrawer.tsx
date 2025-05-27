import { Close as CloseIcon } from '@mui/icons-material';
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
import { formatCurrency } from 'src/utils/formatCurrency';
import type { FieldDef, FormRecord } from './types';

// Custom hook for handling resize
const useResize = (initialWidth: number | string) => {
    const [width, setWidth] = useState(initialWidth);
    const [isResizing, setIsResizing] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startWidth, setStartWidth] = useState(0);
    const [resizeFromLeft, setResizeFromLeft] = useState(false);

    // Convert initialWidth to number for calculations
    useEffect(() => {
        if (typeof initialWidth === 'string' && initialWidth.endsWith('%')) {
            // Convert percentage to pixels
            const percentage = parseInt(initialWidth, 10);
            setWidth(window.innerWidth * (percentage / 100));
        } else if (typeof initialWidth === 'string') {
            setWidth(parseInt(initialWidth, 10));
        } else {
            setWidth(initialWidth);
        }
    }, [initialWidth]);

    const handleMouseDown = useCallback((e: React.MouseEvent, fromLeft: boolean = false) => {
        e.preventDefault();
        setIsResizing(true);
        setStartX(e.clientX);
        setStartWidth(typeof width === 'number' ? width : parseInt(width as string, 10));
        setResizeFromLeft(fromLeft);
    }, [width]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing) return;

        const diff = e.clientX - startX;

        // Calculate new width with direction considered
        let newWidth = startWidth + (resizeFromLeft ? -diff : diff);

        // Set constraints based on screen size
        const minWidth = Math.min(380, window.innerWidth * 0.3); // Minimum 380px or 30% of screen
        const maxWidth = Math.min(1200, window.innerWidth * 0.8); // Maximum 1200px or 80% of screen

        // Apply constraints
        newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));

        setWidth(newWidth);
    }, [isResizing, startX, startWidth, resizeFromLeft]);

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
        setResizeFromLeft(false);
    }, []);

    useEffect(() => {
        if (isResizing) {
            // Add move and up handlers to window to handle dragging outside the component
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            // Add a class to the body to prevent text selection during resize
            document.body.classList.add('resizing');
        } else {
            document.body.classList.remove('resizing');
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            document.body.classList.remove('resizing');
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);

    // Also handle window resize to ensure drawer stays within bounds
    useEffect(() => {
        const handleWindowResize = () => {
            if (typeof width === 'number') {
                // On window resize, ensure width is still within constraints
                const minWidth = Math.min(380, window.innerWidth * 0.3);
                const maxWidth = Math.min(1200, window.innerWidth * 0.8);

                if (width > maxWidth) {
                    setWidth(maxWidth);
                } else if (width < minWidth) {
                    setWidth(minWidth);
                }
            }
        };

        window.addEventListener('resize', handleWindowResize);
        return () => window.removeEventListener('resize', handleWindowResize);
    }, [width]);

    return { width, handleMouseDown, isResizing };
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

export const ViewDrawer = <T extends FormRecord>({
    open,
    onClose,
    title,
    record,
    fields,
    width = 700,
    customActions,
    customContent,
}: ViewDrawerProps<T>) => {
    const { width: drawerWidth, handleMouseDown, isResizing } = useResize(width);
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
                    width: drawerWidth,
                    minWidth: { xs: '90%', sm: '380px' },
                    maxWidth: { xs: '95%', sm: '80%', md: '1200px' },
                    borderTopLeftRadius: 8,
                    borderBottomLeftRadius: 8,
                    boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.08)',
                    background: '#FFFFFF',
                    borderLeft: '1px solid rgba(0, 0, 0, 0.08)',
                    overflow: 'hidden',
                    transition: isResizing ? 'none' : 'width 0.1s ease-out'
                },
            }}
        >
            {/* Left resize handle */}
            <Box
                onMouseDown={(e) => handleMouseDown(e, true)}
                sx={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '12px',
                    cursor: 'ew-resize',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    '&:hover': {
                        '& .resize-handle': {
                            opacity: 1,
                            width: '4px',
                        }
                    },
                    // Hide on mobile
                    [theme.breakpoints.down('sm')]: {
                        display: 'none'
                    }
                }}
            >
                <Tooltip title="Drag to resize" placement="left">
                    <Box
                        className="resize-handle"
                        sx={{
                            height: '50px',
                            width: '3px',
                            backgroundColor: theme.palette.primary.main,
                            opacity: 0.3,
                            borderRadius: '2px',
                            transition: 'opacity 0.2s, width 0.2s',
                        }}
                    />
                </Tooltip>
            </Box>

            <Box
                ref={drawerRef}
                sx={{
                    p: customContent ? 0 : (title ? 3 : '10px 10px 24px 10px'),
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: customContent ? 'transparent' : '#FFFFFF',
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
                        minWidth: { sm: '380px' },
                        width: '100%',
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
                        customContent ? (
                            <Box
                                sx={{
                                    width: '100%',
                                    minWidth: 'inherit',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    flexGrow: 1,
                                    m: 0,
                                    p: 0,
                                    backgroundColor: 'transparent',
                                }}
                            >
                                {customContent}
                            </Box>
                        ) : (
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
                                            {field.options?.[getFieldValue(field)] || getFieldValue(field) || '-'}
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
                                                        label={field.options?.[value] || value}
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