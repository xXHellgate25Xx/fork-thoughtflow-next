import { Box } from '@mui/material';
import { useContactById } from 'src/hooks/tablehooks';
import type { ContactsRecord } from 'src/types/mapAirtableTypes';

interface ContactCardProps {
    contactId: string;
    contact?: Partial<ContactsRecord>;
}


const ContactCard = ({ contactId, contact }: ContactCardProps) => {
    const { record, isLoading: isContactLoading, isError: isContactError } = useContactById(contactId);

    const contactData: Partial<ContactsRecord> | undefined = contact || record;

    if (!contactData) {
        if (isContactLoading) {
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
        if (isContactError) {
            return <Box className="bg-red-50 border border-red-200 p-4 rounded-lg text-center text-red-600 font-medium">
                Error loading contact
            </Box>
        }
        // Show not found box if not loading and not found
        return (
            <Box className="bg-red-50 border border-red-200 p-4 rounded-lg text-center text-red-600 font-medium">
                Contact not found
            </Box>
        );
    }

    return (
        <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="font-semibold mb-3">{contactData['First Name']} {contactData['Last Name']}</div>

            {contactData.Email && (
                <div className="mb-2">
                    <div className="flex items-baseline">
                        <span className="text-xs font-semibold uppercase text-gray-500 mr-2 min-w-[50px]">EMAIL:</span>
                        <a
                            href={`mailto:${contactData.Email}`}
                            className="text-xs text-primary hover:underline break-all"
                            title={contactData.Email as string}
                        >
                            {contactData.Email}
                        </a>
                    </div>
                </div>
            )}

            {contactData.Phone && (
                <div>
                    <div className="flex items-baseline">
                        <span className="text-xs font-semibold uppercase text-gray-500 mr-2 min-w-[50px]">TEL:</span>
                        <div className="text-xs break-all">
                            {contactData.Phone}
                        </div>
                    </div>
                </div>
            )}

            {contactData['Job Title'] && (
                <div className="mt-2">
                    <div className="flex items-baseline">
                        <span className="text-xs font-semibold uppercase text-gray-500 mr-2 min-w-[50px]">TITLE:</span>
                        <div className="text-xs break-all">
                            {contactData['Job Title']}
                        </div>
                    </div>
                </div>
            )}

            {contactData.Website && (
                <div className="mt-2">
                    <div className="flex items-baseline">
                        <span className="text-xs font-semibold uppercase text-gray-500 mr-2 min-w-[50px]">WEB:</span>
                        <a
                            href={contactData.Website.startsWith('http') ? contactData.Website : `https://${contactData.Website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline break-all"
                        >
                            {contactData.Website}
                        </a>
                    </div>
                </div>
            )}

            {contactData.LinkedIn && (
                <div className="mt-2">
                    <div className="flex items-baseline">
                        <span className="text-xs font-semibold uppercase text-gray-500 mr-2 min-w-[50px]">LI:</span>
                        <a
                            href={contactData.LinkedIn}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline break-all"
                        >
                            LinkedIn
                        </a>
                    </div>
                </div>
            )}

            {contactData.Notes && (
                <div className="mt-2">
                    <div className="flex items-start">
                        <span className="text-xs font-semibold uppercase text-gray-500 mr-2 min-w-[50px]">NOTES:</span>
                        <div className="text-xs text-gray-700 break-all">
                            {contactData.Notes}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactCard; 