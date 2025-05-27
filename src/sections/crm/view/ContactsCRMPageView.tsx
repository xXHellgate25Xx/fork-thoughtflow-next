import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { LoadingFallback } from 'src/components/ui/loading-fallback';
import { useContacts, useUpdateContact } from 'src/hooks/tablehooks';
import { useSnackbar } from 'src/hooks/use-snackbar';
import type { QueryOptions, SortCondition } from 'src/types/airtableTypes';
import { EntityPageConfig } from 'src/types/entityConfig';
import type { ContactsRecord } from 'src/types/mapAirtableTypes';
import ContactDetails from '../../../components/CRM/Contacts/ContactDetails';
import { ViewDrawer } from '../../../components/CRM/Modals/ViewDrawer';
import DynamicTable from '../../../components/CRM/Views/DynamicTable';
import { InfiniteBottomObserver } from '../../../components/CRM/Views/InfiniteBottomObserver';

const ContactsCRMPageView = memo(({ config: contactPageConfig }: { config: EntityPageConfig<Partial<ContactsRecord>> }) => {
    // State
    const [selectedContact, setSelectedContact] = useState<Partial<ContactsRecord> | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedLeadSource, setSelectedLeadSource] = useState<string>("All Sources");
    const [sortCondition, setSortCondition] = useState<SortCondition>({ field: 'First Name', direction: 'asc' });

    // Hooks
    const { showSnackbar, SnackbarComponent } = useSnackbar();
    const { mutate: updateContactApi, isLoading: isUpdatingContact } = useUpdateContact();
    const [defaultOptions] = useState<QueryOptions>(contactPageConfig.defaultFilters);
    const {
        records: contacts = [],
        isLoading: isContactsLoading,
        isError,
        error,
        hasMore,
        loadMore,
        resetRecords
    } = useContacts(defaultOptions);

    // Debug log when component mounts or updates
    useEffect(() => {
        console.log('ContactsCRMPageView mounted/updated');
        console.log('updateContactApi is available:', typeof updateContactApi === 'function');
    }, [updateContactApi]);

    // Memoized values
    const { accounts = [] } = contactPageConfig.masterData || {};
    const formFields = contactPageConfig.detailConfig.formFields;
    const columnsConfig = contactPageConfig.tableConfig.tableColumns;
    const isAdmin = contactPageConfig.CRMAuth.isAdmin;

    // Extract unique lead sources from contacts
    const leadSources = useMemo(() => {
        const sources = new Set<string>();
        contacts.forEach(contact => {
            const source = contact['Lead Source'] as string;
            if (source) sources.add(source);
        });
        return ["All Sources", ...Array.from(sources)];
    }, [contacts]);

    // Filter contacts based on selected lead source
    const filteredContacts = useMemo(() => contacts.filter(contact => {
        // Filter by lead source
        if (selectedLeadSource !== "All Sources" && contact['Lead Source'] !== selectedLeadSource) {
            return false;
        }
        return true;
    }), [contacts, selectedLeadSource]);

    // Sort data
    const sortedContacts = useMemo(() => [...filteredContacts].sort((a, b) => {
        const field = sortCondition.field;
        const direction = sortCondition.direction;

        // Get values for comparison
        const valueA = a[field as keyof typeof a] || '';
        const valueB = b[field as keyof typeof b] || '';

        // For empty values
        if (!valueA && !valueB) return 0;
        if (!valueA) return 1;
        if (!valueB) return -1;

        // String comparison
        if (typeof valueA === 'string' && typeof valueB === 'string') {
            return direction === 'asc'
                ? valueA.localeCompare(valueB)
                : valueB.localeCompare(valueA);
        }

        // Number comparison
        if (typeof valueA === 'number' && typeof valueB === 'number') {
            return direction === 'asc'
                ? valueA - valueB
                : valueB - valueA;
        }

        return 0;
    }), [filteredContacts, sortCondition]);

    // Handlers
    const handleRowClick = useCallback((contact: Partial<ContactsRecord>) => {
        setSelectedContact(contact);
        setDrawerOpen(true);
        setIsEditMode(false);
    }, []);

    const handleCloseContactDrawer = useCallback(() => {
        setDrawerOpen(false);
        setIsEditMode(false);
        setTimeout(() => {
            setSelectedContact(null);
        }, 300);
    }, []);

    const handleToggleEditMode = useCallback(() => {
        setIsEditMode(prevMode => !prevMode);
    }, []);

    const handleUpdateContact = useCallback(async (updatedContact: Partial<ContactsRecord>) => {
        console.log('handleUpdateContact called with:', updatedContact);

        try {
            setIsSubmitting(true);

            if (!selectedContact) {
                console.error('No contact selected');
                setIsSubmitting(false);
                showSnackbar('Cannot update contact: No contact selected', 'error');
                return;
            }

            if (!selectedContact.id) {
                console.error('Selected contact has no ID:', selectedContact);
                setIsSubmitting(false);
                showSnackbar('Cannot update contact: Missing contact ID', 'error');
                return;
            }

            // Log the contact being updated
            console.log('Updating contact with ID:', selectedContact.id);

            // Determine which fields have changed
            const changedFields = Object.entries(updatedContact).reduce((acc, [key, value]) => {
                if (value !== selectedContact[key as keyof ContactsRecord]) {
                    acc[key as keyof ContactsRecord] = value;
                }
                return acc;
            }, {} as Partial<ContactsRecord>);

            console.log('Changed fields:', changedFields);

            if (Object.keys(changedFields).length === 0) {
                console.log('No changes detected');
                showSnackbar('No changes to update', 'info');
                setIsSubmitting(false);
                setIsEditMode(false);
                return;
            }

            try {
                console.log('Calling updateContactApi with:', selectedContact.id, changedFields);

                // Call the API to update the contact
                const updatedRecord = await updateContactApi(selectedContact.id, changedFields);

                console.log('API call successful, updated record:', updatedRecord);

                // Update the selected contact with the response data
                setSelectedContact(updatedRecord);

                // Show success message
                showSnackbar('Contact updated successfully', 'success', true);

                // Turn off edit mode and close drawer immediately
                setIsEditMode(false);
                setDrawerOpen(false);
            } catch (apiError) {
                console.error('API Error updating contact:', apiError);
                showSnackbar(`Failed to update contact: ${apiError instanceof Error ? apiError.message : 'API error'}`, 'error');
            }

            setIsSubmitting(false);
        } catch (err) {
            console.error('Exception in handleUpdateContact:', err);
            setIsSubmitting(false);
            showSnackbar(`Failed to update contact: ${err instanceof Error ? err.message : 'Unknown error'}`, 'error');
        }
    }, [showSnackbar, selectedContact, updateContactApi]);

    // Dropdown handlers
    const handleLeadSourceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedLeadSource(e.target.value);
    }, []);

    const handleSort = useCallback((field: string, direction: 'asc' | 'desc') => {
        setSortCondition({ field, direction });
    }, []);

    return (
        <div className="w-full h-full text-xs pb-0">
            {isContactsLoading && <LoadingFallback />}

            {/* Filter section */}
            <div className="w-full pb-2 mb-4">
                <div className="flex items-center text-xs mb-1">
                    <span className="mr-2">Lead Source</span>
                    <div className="relative inline-block">
                        <select
                            value={selectedLeadSource}
                            onChange={handleLeadSourceChange}
                            className="appearance-none bg-transparent pr-8 pl-1 py-1 text-blue-500 font-medium focus:outline-none cursor-pointer border-none"
                        >
                            {leadSources.map(source => (
                                <option key={source} value={source}>{source}</option>
                            ))}
                        </select>
                        <Iconify
                            icon="mdi:chevron-down"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 text-blue-500"
                            width={14}
                        />
                    </div>
                </div>
            </div>

            <div className="h-[calc(100vh-120px)] flex flex-col">
                <div className="flex-grow overflow-auto">
                    <DynamicTable<Partial<ContactsRecord>>
                        columns={columnsConfig}
                        data={sortedContacts}
                        isLoading={isContactsLoading}
                        isError={isError}
                        error={error}
                        onRowClick={handleRowClick}
                        getRowId={(row) => row.id || `row-${Math.random().toString(36).substr(2, 9)}`}
                        errorMessage="Error loading data"
                        noDataMessage="No contacts found."
                        onSort={handleSort}
                        sortCondition={sortCondition}
                        bottomComponent={
                            <InfiniteBottomObserver
                                hasMore={hasMore}
                                loading={isContactsLoading}
                                columns={columnsConfig}
                                onLoadMore={loadMore}
                                totalRecords={sortedContacts.length}
                            />
                        }
                    />
                </div>
            </div>

            {/* Contact Details Drawer */}
            <ViewDrawer
                open={drawerOpen}
                onClose={handleCloseContactDrawer}
                title=""
                record={selectedContact}
                fields={formFields}
                width={700}
                customContent={
                    selectedContact && (
                        <ContactDetails
                            contact={selectedContact}
                            accounts={accounts}
                            fields={formFields}
                            onEditClick={handleToggleEditMode}
                            onClose={handleCloseContactDrawer}
                            isEditMode={isEditMode}
                            onSave={handleUpdateContact}
                            isSubmitting={isSubmitting || isUpdatingContact}
                        />
                    )
                }
                customActions={null}
            />

            {SnackbarComponent}
        </div>
    );
});

export default ContactsCRMPageView; 