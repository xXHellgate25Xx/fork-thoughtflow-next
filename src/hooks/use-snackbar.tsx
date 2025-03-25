import { Alert, AlertColor, Snackbar } from '@mui/material';
import { ReactNode, useCallback, useState } from 'react';

interface SnackbarState {
    open: boolean;
    message: string | ReactNode;
    severity: AlertColor;
    isSuccess?: boolean;
    action?: ReactNode;
    autoHideDuration?: number;
}

export interface SnackbarContextType {
    snackbar: SnackbarState;
    showSnackbar: (
        message: string | ReactNode,
        severity?: AlertColor,
        isSuccess?: boolean,
        action?: ReactNode
    ) => void;
    hideSnackbar: () => void;
    SnackbarComponent: ReactNode;
}

export function useSnackbar(): SnackbarContextType {
    const [snackbar, setSnackbar] = useState<SnackbarState>({
        open: false,
        message: '',
        severity: 'error',
        isSuccess: false,
        autoHideDuration: 6000,
    });

    const showSnackbar = useCallback((
        message: string | ReactNode,
        severity: AlertColor = 'error',
        isSuccess: boolean = false,
        action?: ReactNode,
        autoHideDuration?: number
    ) => {
        setSnackbar({
            open: true,
            message,
            severity,
            isSuccess,
            action,
            autoHideDuration: autoHideDuration || 6000,
        });
    }, []);

    const hideSnackbar = useCallback(() => {
        setSnackbar((prev) => ({
            ...prev,
            open: false,
        }));
    }, []);

    return {
        snackbar,
        showSnackbar,
        hideSnackbar,
        SnackbarComponent: (
            <Snackbar
                open={snackbar.open}
                autoHideDuration={snackbar.isSuccess ? null : snackbar.autoHideDuration}
                onClose={hideSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={hideSnackbar}
                    severity={snackbar.severity}
                    className='w-full border-2 border-gray-300'
                    action={snackbar.action}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        ),
    };
} 