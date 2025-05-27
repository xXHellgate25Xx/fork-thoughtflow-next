import { format as formatDate } from 'date-fns';
import { useState, useEffect } from 'react';
import type { AccountsRecord, ContactsRecord, OpportunitiesRecord } from 'src/types/mapAirtableTypes';
import { formatCurrency } from 'src/utils/formatCurrency';
import { Iconify } from 'src/components/iconify';
import type { FieldDef } from '../Modals/types';
import Opportunity from '../Opportunities/OpportunityCard';
import ContactCard from '../Contacts/ContactCard';

interface AccountDetailsProps {
    account: Partial<AccountsRecord>;
    opportunities: Partial<OpportunitiesRecord>[];
    contacts: Partial<ContactsRecord>[];
    fields: FieldDef<Partial<AccountsRecord>>[];
    onOpportunityClick?: (opportunity: OpportunitiesRecord) => void;
    stageLabels: Record<string, string>;
    onEditClick?: () => void;
    onClose?: () => void;
    isEditMode?: boolean;
    onSave?: (account: Partial<AccountsRecord>) => void;
    isSubmitting?: boolean;
}

// Type guard to check if an object is a full OpportunitiesRecord
function isOpportunitiesRecord(obj: any): obj is OpportunitiesRecord {
    return obj && typeof obj.id === 'string';
}

// Required fields for validation
const REQUIRED_FIELDS = ['Name', 'Website'];

const AccountDetails = ({
    account,
    opportunities,
    contacts,
    fields,
    onOpportunityClick,
    stageLabels,
    onEditClick,
    onClose,
    isEditMode = false,
    onSave,
    isSubmitting = false
}: AccountDetailsProps) => {
    const [formData, setFormData] = useState<Partial<AccountsRecord>>(account);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
    
    // Update form data when account changes
    useEffect(() => {
        setFormData(account);
        setErrors({});
        setTouchedFields({});
    }, [account, isEditMode]);

    const validateField = (field: string, value: any): string => {
        if (REQUIRED_FIELDS.includes(field) && (!value || value.trim() === '')) {
            return 'Field can not be empty';
        }
        return '';
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        let isValid = true;

        // Check all required fields
        REQUIRED_FIELDS.forEach(field => {
            const error = validateField(field, formData[field as keyof typeof formData]);
            if (error) {
                newErrors[field] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        
        // Mark all fields as touched if there are validation errors
        if (!isValid) {
            const newTouched: Record<string, boolean> = {};
            REQUIRED_FIELDS.forEach(field => {
                newTouched[field] = true;
            });
            setTouchedFields(prev => ({ ...prev, ...newTouched }));
        }
        
        return isValid;
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Validate on change if the field has been touched
        if (touchedFields[field]) {
            const error = validateField(field, value);
            setErrors(prev => ({
                ...prev,
                [field]: error
            }));
        }
    };

    const handleBlur = (field: string) => {
        // Mark field as touched
        setTouchedFields(prev => ({
            ...prev,
            [field]: true
        }));
        
        // Validate on blur
        const error = validateField(field, formData[field as keyof typeof formData]);
        setErrors(prev => ({
            ...prev,
            [field]: error
        }));
    };

    const handleSave = () => {
        if (validateForm() && onSave) {
            onSave(formData);
        }
    };

    const handleOpportunityClick = (opportunity: OpportunitiesRecord) => {
        if (onOpportunityClick) {
            onOpportunityClick(opportunity);
        }
    };

    const handleOpportunityKeyDown = (e: React.KeyboardEvent, opportunity: Partial<OpportunitiesRecord>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (isOpportunitiesRecord(opportunity) && onOpportunityClick) {
                onOpportunityClick(opportunity);
            }
        }
    };

    const getFilteredOpportunities = () => opportunities.filter(
        opp => account.Opportunities?.includes(opp.id as string) ?? false
    );

    const getFilteredContacts = () => contacts.filter(
        contact => account.Contacts?.includes(contact.id as string) ?? false
    );

    const filteredOpportunities = getFilteredOpportunities();
    const filteredContacts = getFilteredContacts();

    // Helper function to get priority badge styling
    const getPriorityBadge = (priority: string) => {
        const priorityColors: Record<string, string> = {
            'High': 'bg-red-100 text-red-800 border border-red-200',
            'Medium': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
            'Low': 'bg-green-100 text-green-800 border border-green-200'
        };
        
        return (
            <span className={`px-3 py-1 text-xs font-medium rounded-md ${priorityColors[priority] || 'bg-gray-50 text-gray-800'}`}>
                {priority}
            </span>
        );
    };

    // Get options for select fields
    const priorityOptions = ['High', 'Medium', 'Low'];
    const leadSourceOptions = ['Referral', 'Marketing', 'Sales', 'Website', 'Social Media', 'Other'];

    // Get the field definition for a specific field
    const getFieldDef = (name: string) => fields.find(field => field.name === name);

                    return (
        <div className="bg-gray-50 w-full h-full overflow-auto">
            <div className="p-8">
                {/* Header with Edit/Save/Cancel Buttons */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Account Details</h2>
                    {isEditMode ? (
                        <div className="flex space-x-2">
                            <button 
                                type="button"
                                onClick={onEditClick}
                                className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button 
                                type="button"
                                onClick={handleSave}
                                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                disabled={isSubmitting}
                            >
                                {isSubmitting && (
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                )}
                                {isSubmitting ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    ) : (
                        <button 
                            type="button"
                            onClick={onEditClick}
                            className="p-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
                        >
                            <Iconify icon="tabler:edit" className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Basic information in two columns */}
                <div className="grid grid-cols-2 gap-x-16 gap-y-6 mb-8">
                    {/* Account Name */}
                    <div className="col-span-1">
                        <h3 className="text-xs uppercase text-primary mb-1">ACCOUNT NAME</h3>
                        {isEditMode ? (
                            <div>
                                <input
                                    type="text"
                                    value={formData.Name || ''}
                                    onChange={e => handleInputChange('Name', e.target.value)}
                                    onBlur={() => handleBlur('Name')}
                                    className={`w-full border ${errors.Name ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                                />
                                {errors.Name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.Name}</p>
                                )}
                            </div>
                        ) : (
                            <div className="text-base text-gray-800">{account.Name || '-'}</div>
                        )}
                    </div>

                    {/* Priority */}
                    <div className="col-span-1">
                        <h3 className="text-xs uppercase text-primary mb-1">PRIORITY</h3>
                        {isEditMode ? (
                            <div className="relative">
                                <select
                                    value={formData.Priority as string || ''}
                                    onChange={e => handleInputChange('Priority', e.target.value)}
                                    className="w-full appearance-none border border-gray-300 rounded-md p-2 pr-8"
                                >
                                    {priorityOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <Iconify icon="tabler:chevron-down" className="w-5 h-5 text-gray-500" />
                                </div>
                            </div>
                        ) : (
                            <div>{account.Priority ? getPriorityBadge(account.Priority as string) : '-'}</div>
                        )}
                    </div>

                    {/* Industry */}
                    <div className="col-span-1">
                        <h3 className="text-xs uppercase text-primary mb-1">INDUSTRY</h3>
                        {isEditMode ? (
                            <div>
                                <input
                                    type="text"
                                    value={formData.Industry as string || ''}
                                    onChange={e => handleInputChange('Industry', e.target.value)}
                                    onBlur={() => handleBlur('Industry')}
                                    className={`w-full border ${errors.Industry ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                                />
                                {errors.Industry && (
                                    <p className="text-red-500 text-xs mt-1">{errors.Industry}</p>
                                )}
                            </div>
                        ) : (
                            <div className="text-gray-800">{account.Industry || '-'}</div>
                        )}
                    </div>

                    {/* Website */}
                    <div className="col-span-1">
                        <h3 className="text-xs uppercase text-primary mb-1">WEBSITE</h3>
                        {isEditMode ? (
                            <div>
                                <input
                                    type="text"
                                    value={formData.Website as string || ''}
                                    onChange={e => handleInputChange('Website', e.target.value)}
                                    onBlur={() => handleBlur('Website')}
                                    className={`w-full border ${errors.Website ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                                    placeholder="www.placeholder.com"
                                />
                                {errors.Website && (
                                    <p className="text-red-500 text-xs mt-1">{errors.Website}</p>
                                )}
                            </div>
                        ) : (
                            <div>
                                {account.Website ? (
                                    <a
                                        href={account.Website.toString().startsWith('http') 
                                            ? account.Website.toString() 
                                            : `https://${account.Website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                                        className="text-primary hover:text-primary/80 hover:underline"
                                    >
                                        {account.Website}
                                    </a>
                                ) : '-'}
                            </div>
                        )}
                    </div>

                    {/* Research */}
                    <div className="col-span-1">
                        <h3 className="text-xs uppercase text-primary mb-1">RESEARCH</h3>
                        {isEditMode ? (
                            <div>
                                <input
                                    type="text"
                                    value={formData.Research as string || ''}
                                    onChange={e => handleInputChange('Research', e.target.value)}
                                    onBlur={() => handleBlur('Research')}
                                    className={`w-full border ${errors.Research ? 'border-red-500' : 'border-gray-300'} rounded-md p-2`}
                                    placeholder="www.placeholder.com"
                                />
                                {errors.Research && (
                                    <p className="text-red-500 text-xs mt-1">{errors.Research}</p>
                                )}
                            </div>
                        ) : (
                            <div>
                                {account.Research ? (
                                    <a
                                        href={account.Research as string}
                            target="_blank"
                            rel="noopener noreferrer"
                                        className="text-primary hover:text-primary/80 hover:underline"
                        >
                            View Research
                        </a>
                                ) : '-'}
                            </div>
                        )}
                    </div>

                    {/* Lead Source */}
                    <div className="col-span-1">
                        <h3 className="text-xs uppercase text-primary mb-1">LEAD SOURCE</h3>
                        {isEditMode ? (
                            <div className="relative">
                                <select
                                    value={formData['Account Lead Source '] as string || ''}
                                    onChange={e => handleInputChange('Account Lead Source ', e.target.value)}
                                    className="w-full appearance-none border border-gray-300 rounded-md p-2 pr-8"
                                >
                                    {leadSourceOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <Iconify icon="tabler:chevron-down" className="w-5 h-5 text-gray-500" />
                                </div>
                            </div>
                        ) : (
                            <div className="text-gray-800">{account['Account Lead Source '] || 'Referral'}</div>
                        )}
                    </div>

                    {/* Created */}
                    <div className="col-span-1">
                        <h3 className="text-xs uppercase text-primary mb-1">CREATED</h3>
                        <div className="text-gray-800">
                            {isEditMode ? (
                                <input
                                    type="text"
                                    value={account.Created ? formatDate(new Date(account.Created as string), 'MM/dd/yyyy') : '-'}
                                    disabled
                                    className="w-full border border-gray-100 bg-gray-50 rounded-md p-2 text-gray-500"
                                />
                            ) : (
                                account.Created ? formatDate(new Date(account.Created as string), 'MM/dd/yyyy') : '-'
                            )}
                        </div>
                    </div>

                    {/* Last Modified */}
                    <div className="col-span-1">
                        <h3 className="text-xs uppercase text-primary mb-1">LAST MODIFIED</h3>
                        <div className="text-gray-800">
                            {isEditMode ? (
                                <input
                                    type="text"
                                    value={account['Last Modified'] ? formatDate(new Date(account['Last Modified'] as string), 'MM/dd/yyyy') : '-'}
                                    disabled
                                    className="w-full border border-gray-100 bg-gray-50 rounded-md p-2 text-gray-500"
                                />
                            ) : (
                                account['Last Modified'] ? formatDate(new Date(account['Last Modified'] as string), 'MM/dd/yyyy') : '-'
                            )}
                        </div>
                    </div>
            </div>

            {/* Contacts Section */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contacts</h3>
                {!account.Contacts || account.Contacts.length === 0 ? (
                    <div className="text-sm text-gray-500">No contacts found for this account.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {account.Contacts.map((contactId: string) => {
                            const contact = contacts.find(c => c.id === contactId);
                            if (!contact) return null;
                            return <ContactCard key={contactId} contactId={contactId} contact={contact} />;
                        })}
                    </div>
                )}
            </div>

            {/* Opportunities Section */}
            <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Opportunities ({filteredOpportunities.length})</h3>
                    
                    {filteredOpportunities.length === 0 ? (
                    <div className="text-sm text-gray-500">No opportunities found for this account.</div>
                ) : (
                    <div className="space-y-4">
                            {filteredOpportunities.map((opportunity) => (
                                <div
                                    key={opportunity.id} 
                                    className="p-4 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow border border-gray-100"
                                    onClick={() => {
                                        if (isOpportunitiesRecord(opportunity)) {
                                            onOpportunityClick?.(opportunity);
                                        }
                                    }}
                                    onKeyDown={(e) => handleOpportunityKeyDown(e, opportunity)}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`View opportunity ${opportunity.Name}`}
                                >
                                    <div className="flex justify-between mb-2">
                                        <div className="font-semibold">{opportunity.Name}</div>
                                        <div className="font-medium text-primary">{formatCurrency(opportunity.Amount)}</div>
                                    </div>
                                    
                                    <div className="p-2 bg-blue-50 text-primary text-xs font-semibold rounded-md inline-block">
                                        {opportunity.Stage ? stageLabels[opportunity.Stage as string] || opportunity.Stage : '-'}
                                    </div>
                                    
                                    <div className="mt-4 text-xs text-gray-500">
                                        <div className="uppercase font-semibold mb-1 text-primary">ACTUAL REVENUE</div>
                                        <div className="flex justify-between">
                                            <div>{formatCurrency(opportunity['Actual Revenue' as keyof typeof opportunity] as number || 0)}</div>
                                            <div>
                                                <span className="uppercase font-semibold mr-1 text-primary">CREATED</span>
                                                {opportunity.Created 
                                                    ? formatDate(new Date(opportunity.Created as string), 'MM/dd/yyyy') 
                                                    : '-'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {!isEditMode && (
                    <div className="mt-auto pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="border border-primary rounded-md px-4 py-2 text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountDetails; 