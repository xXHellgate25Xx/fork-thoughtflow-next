import { useEffect, useState } from 'react';
import { useSnackbar } from 'src/hooks/use-snackbar';
import { useRouter } from 'src/routes/hooks';
import { setToken } from 'src/utils/auth';


export default function OauthCallbackPage() {
    const { showSnackbar, SnackbarComponent } = useSnackbar();
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const onRedirect = () => {
        router.push('/auth/sign-in');
    }
    useEffect(() => {
        const handleCallback = async () => {
            try {
                const hash = window.location.hash.substring(1);
                const params = new URLSearchParams(hash);
                const access_token = params.get('access_token');
                const refresh_token = params.get('refresh_token');
                if (!access_token || !refresh_token) {
                    throw new Error('Missing tokens in URL');
                }
                setToken(access_token, refresh_token);
                showSnackbar('Google sign-in successful', 'success');
                router.push('/select-account');
            } catch (err) {
                console.error('Error in callback:', err);
                setError(err instanceof Error ? err.message : 'An error occurred');
            }
        };

        handleCallback();
    }, [router]);

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
                    <p className="text-gray-600">{error}</p>
                    <button
                        type="button"
                        onClick={onRedirect}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Return to Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Signing you in...</h1>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            </div>
            {SnackbarComponent}
        </div>
    );
} 