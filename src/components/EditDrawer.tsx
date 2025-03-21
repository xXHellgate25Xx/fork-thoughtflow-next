import {
    Box,
    Button,
    Drawer,
    FormControl,
    IconButton,
    InputAdornment,
    MenuItem,
    Select,
    SelectChangeEvent,
    TextField,
    Typography,
    alpha,
    useTheme
} from '@mui/material';
import { ReactNode } from 'react';
import { Iconify } from './iconify';

// Field definition type
export interface FieldDef {
    name: string;
    label: string;
    type?: 'text' | 'number' | 'textarea' | 'select' | 'currency' | 'custom';
    options?: { value: string; label: string }[];
    rows?: number;
    renderField?: (value: any, onChange: (value: any) => void) => ReactNode;
    helperText?: string;
    defaultValue?: any;
}

// Record type for form data
export type FormRecord = Record<string, string | number | boolean | null | undefined>;

// Drawer props type
export interface EditDrawerProps {
    open: boolean;
    onClose: () => void;
    title?: string | ReactNode;
    record: FormRecord | null;
    onSave: (record: FormRecord) => void;
    onInputChange: (field: string, value: any) => void;
    fields: FieldDef[];
    width?: number | string;
}

export default function EditDrawer({
    open,
    onClose,
    title,
    record,
    onSave,
    onInputChange,
    fields,
    width = 450,
}: EditDrawerProps) {
    const theme = useTheme();

    if (!record) return null;

    const handleSave = () => {
        onSave(record);
    };

    const handleClose = () => {
        onClose();
    };

    // Get a field value based on priority order
    const getFieldValue = (field: FieldDef): any => {
        // If record has this field, use it
        if (record[field.name] !== undefined) {
            return record[field.name];
        }

        // For select fields with options, use the first option as default if no default is specified
        if (field.type === 'select' && field.options && field.options.length > 0) {
            return field.defaultValue !== undefined ? field.defaultValue : field.options[0].value;
        }

        // Fall back to default value or empty string for other field types
        return field.defaultValue !== undefined ? field.defaultValue : '';
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
                    borderTopLeftRadius: 16,
                    borderBottomLeftRadius: 16,
                    boxShadow: theme.shadows[8],
                    background: alpha(theme.palette.background.paper, 0.95),
                    backdropFilter: 'blur(8px)',
                    transition: theme.transitions.create(['width', 'box-shadow'], {
                        duration: theme.transitions.duration.shorter,
                        easing: theme.transitions.easing.easeInOut,
                    }),
                },
            }}
        >
            <Box
                sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={3}
                    sx={{
                        pb: 2,
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                        }}
                    >
                        {title || 'Edit Record'}
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
                    {fields.map((field, index) => (
                        <Box
                            mb={3}
                            key={field.name}
                            sx={{
                                animation: `fadeIn ${0.3 + index * 0.05}s ease-in-out`,
                                '@keyframes fadeIn': {
                                    '0%': { opacity: 0, transform: 'translateY(10px)' },
                                    '100%': { opacity: 1, transform: 'translateY(0)' },
                                },
                            }}
                        >
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                mb={1}
                                sx={{
                                    fontWeight: 500,
                                    letterSpacing: '0.1px',
                                }}
                            >
                                {field.label}
                            </Typography>

                            {field.renderField ? (
                                field.renderField(getFieldValue(field), (value) => onInputChange(field.name, value))
                            ) : field.type === 'textarea' ? (
                                <TextField
                                    fullWidth
                                    multiline
                                    rows={field.rows || 4}
                                    size="small"
                                    value={getFieldValue(field)}
                                    onChange={(e) => onInputChange(field.name, e.target.value)}
                                    variant="outlined"
                                    helperText={field.helperText}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: alpha(theme.palette.background.default, 0.5),
                                            '&:hover': {
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: theme.palette.primary.light,
                                                }
                                            }
                                        }
                                    }}
                                />
                            ) : field.type === 'select' ? (
                                <FormControl
                                    fullWidth
                                    size="small"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: alpha(theme.palette.background.default, 0.5),
                                            '&:hover': {
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: theme.palette.primary.light,
                                                }
                                            }
                                        }
                                    }}
                                >
                                    <Select
                                        value={String(getFieldValue(field) || '')}
                                        onChange={(e: SelectChangeEvent) => onInputChange(field.name, e.target.value)}
                                        MenuProps={{
                                            PaperProps: {
                                                sx: {
                                                    boxShadow: theme.shadows[4],
                                                    borderRadius: 1,
                                                },
                                            },
                                        }}
                                        renderValue={(selected) => {
                                            // Find the option with matching value to display its label
                                            const option = field.options?.find(opt => opt.value === selected);
                                            return option ? option.label : selected;
                                        }}
                                    >
                                        {field.options?.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            ) : field.type === 'number' ? (
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    value={getFieldValue(field)}
                                    onChange={(e) => onInputChange(field.name, parseFloat(e.target.value))}
                                    variant="outlined"
                                    helperText={field.helperText}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: alpha(theme.palette.background.default, 0.5),
                                            '&:hover': {
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: theme.palette.primary.light,
                                                }
                                            }
                                        }
                                    }}
                                />
                            ) : field.type === 'currency' ? (
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    value={getFieldValue(field)}
                                    onChange={(e) => onInputChange(field.name, parseFloat(e.target.value))}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Typography color="text.secondary">$</Typography>
                                            </InputAdornment>
                                        ),
                                    }}
                                    variant="outlined"
                                    helperText={field.helperText}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: alpha(theme.palette.background.default, 0.5),
                                            '&:hover': {
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: theme.palette.primary.light,
                                                }
                                            }
                                        }
                                    }}
                                />
                            ) : (
                                <TextField
                                    fullWidth
                                    size="small"
                                    value={String(getFieldValue(field) || '')}
                                    onChange={(e) => onInputChange(field.name, e.target.value)}
                                    variant="outlined"
                                    helperText={field.helperText}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: alpha(theme.palette.background.default, 0.5),
                                            '&:hover': {
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: theme.palette.primary.light,
                                                }
                                            }
                                        }
                                    }}
                                />
                            )}
                        </Box>
                    ))}
                </Box>

                <Box
                    display="flex"
                    justifyContent="space-between"
                    mt={3}
                    pt={2}
                    sx={{
                        borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    }}
                >
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={handleClose}
                        sx={{
                            minWidth: 100,
                            borderRadius: 1.5,
                            fontWeight: 500,
                            transition: theme.transitions.create(['background-color', 'box-shadow'], {
                                duration: theme.transitions.duration.short,
                            }),
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        sx={{
                            minWidth: 100,
                            borderRadius: 1.5,
                            boxShadow: theme.shadows[2],
                            fontWeight: 500,
                            '&:hover': {
                                boxShadow: theme.shadows[4],
                            },
                            transition: theme.transitions.create(['background-color', 'box-shadow'], {
                                duration: theme.transitions.duration.short,
                            }),
                        }}
                    >
                        Save
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
} 