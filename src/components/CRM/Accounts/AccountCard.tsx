import { Box } from '@mui/material';
import type { AccountsRecord } from 'src/types/mapAirtableTypes';
import { useAccountById } from 'src/hooks/tablehooks';

interface AccountCardProps {
    accountId: string;
    account?: Partial<AccountsRecord>;
}

const AccountCard = ({ accountId, account }: AccountCardProps) => {
    const { record, isLoading: isAccountLoading, isError: isAccountError } = useAccountById(accountId);

    const accountData: Partial<AccountsRecord> | undefined = account || record;

    if (!accountData) {
        if (isAccountLoading) {
            return <Box className="bg-gray-100/40 border border-gray-200 p-3 rounded-lg max-w ">
                <div className="animate-pulse space-y-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="border-b border-gray-200 pb-4 mb-4">
                            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            </Box>
        }
        if (isAccountError) {
            return <></> 
        }
        // Show not found box if not loading and not found
        return (
            <Box className="bg-red-50 border border-red-200 p-4 rounded-lg text-center text-red-600 font-medium">
                Account not found
            </Box>
        );
    }

    return (
        <div className="border rounded-xl p-5 bg-white hover:shadow-md transition-shadow flex flex-col gap-2">
            <div className="flex justify-between items-center">
                <div>
                    <div className="text-base font-semibold text-gray-900">
                        {accountData.Name}
                    </div>
                    {accountData.Industry && (
                        <div className="text-sm text-gray-500">{accountData.Industry}</div>
                    )}
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                    {accountData.Website && (
                        <a
                            href={accountData.Website.startsWith('http') ? accountData.Website : `https://${accountData.Website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                        >
                            {accountData.Website}
                        </a>
                    )}
                    {accountData.Priority && (
                        <span className="text-xs text-gray-500">Priority: {accountData.Priority}</span>
                    )}
                    {accountData['Account Lead Source '] && (
                        <span className="text-xs text-gray-500">Lead Source: {accountData['Account Lead Source ']}</span>
                    )}
                </div>
            </div>
            {accountData.Research && (
                <div className="text-xs text-gray-500 mt-1">
                    Research: <a href={accountData.Research} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-700 hover:underline">View</a>
                </div>
            )}
        </div>
    );
};

export default AccountCard;
