import { format as formatDate } from 'date-fns';
import { useState, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import type { ContactsRecord, AccountsRecord } from 'src/types/mapAirtableTypes';
import type { FieldDef } from '../Modals/types';

interface ContactDetailsProps {
    contact: Partial<ContactsRecord>;
    accounts: Partial<AccountsRecord>[];
    fields: FieldDef<Partial<ContactsRecord>>[];
    onEditClick?: () => void;
    onClose?: () => void;
    isEditMode?: boolean;
    onSave?: (contact: Partial<ContactsRecord>) => void;
    isSubmitting?: boolean;
}

// Required fields for validation
const REQUIRED_FIELDS = ['First Name', 'Last Name'];

const ContactDetails = ({
    contact,
    accounts,
    fields,
    onEditClick,
    onClose,
    isEditMode = false,
    onSave,
    isSubmitting = false
}: ContactDetailsProps) => {
    const [formData, setFormData] = useState<Partial<ContactsRecord>>(contact);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
    
    // Update form data when contact changes
    useEffect(() => {
        setFormData(contact);
        setErrors({});
        setTouchedFields({});
    }, [contact, isEditMode]);

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

    // Get related company if available
    const relatedCompany = contact.Company;

    // Get options for select fields
    const preferredContactMethods = ['Call', 'Email', 'Text', 'Meeting', 'Other', 'Referral'];
    
    // Get the field definition for a specific field
    const getFieldDef = (name: string) => fields.find(field => field.name === name);

    return (
        <div className="bg-gray-50 w-full h-full overflow-auto">
            <div className="p-8">
                {/* Header with Edit/Save/Cancel Buttons */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Contact Details</h2>
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

                {/* Section 1: Basic Information */}
                <div className="mb-6">
                    <div className="grid grid-cols-2 gap-x-16 gap-y-6">
                        {/* First Name */}
                        <div className="col-span-1">
                            <h3 className="text-xs uppercase text-primary mb-1">FIRST NAME</h3>
                            {isEditMode ? (
                                <div>
                                    <input
                                        type="text"
                                        value={formData['First Name'] || ''}
                                        onChange={e => handleInputChange('First Name', e.target.value)}
                                        onBlur={() => handleBlur('First Name')}
                                        className={`w-full border ${errors['First Name'] ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 bg-white`}
                                    />
                                    {errors['First Name'] && (
                                        <p className="text-red-500 text-xs mt-1">{errors['First Name']}</p>
                                    )}
                                </div>
                            ) : (
                                <div className="text-base text-gray-800">{contact['First Name'] || '-'}</div>
                            )}
                        </div>

                        {/* Last Name */}
                        <div className="col-span-1">
                            <h3 className="text-xs uppercase text-primary mb-1">LAST NAME</h3>
                            {isEditMode ? (
                                <div>
                                    <input
                                        type="text"
                                        value={formData['Last Name'] || ''}
                                        onChange={e => handleInputChange('Last Name', e.target.value)}
                                        onBlur={() => handleBlur('Last Name')}
                                        className={`w-full border ${errors['Last Name'] ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 bg-white`}
                                    />
                                    {errors['Last Name'] && (
                                        <p className="text-red-500 text-xs mt-1">{errors['Last Name']}</p>
                                    )}
                                </div>
                            ) : (
                                <div className="text-base text-gray-800">{contact['Last Name'] || '-'}</div>
                            )}
                        </div>

                        {/* Email */}
                        <div className="col-span-1">
                            <h3 className="text-xs uppercase text-primary mb-1">EMAIL</h3>
                            {isEditMode ? (
                                <div>
                                    <input
                                        type="text"
                                        value={formData.Email as string || ''}
                                        onChange={e => handleInputChange('Email', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md p-2 bg-white"
                                    />
                                </div>
                            ) : (
                                <div>
                                    {contact.Email ? (
                                        <a 
                                            href={`mailto:${contact.Email}`}
                                            className="text-primary hover:text-primary/80 hover:underline"
                                        >
                                            {contact.Email}
                                        </a>
                                    ) : '-'}
                                </div>
                            )}
                        </div>

                        {/* Phone */}
                        <div className="col-span-1">
                            <h3 className="text-xs uppercase text-primary mb-1">PHONE</h3>
                            {isEditMode ? (
                                <div>
                                    <input
                                        type="tel"
                                        value={formData.Phone as string || ''}
                                        onChange={e => handleInputChange('Phone', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md p-2 bg-white"
                                    />
                                </div>
                            ) : (
                                <div className="text-gray-800">{contact.Phone || '-'}</div>
                            )}
                        </div>

                        {/* Job Title */}
                        <div className="col-span-1">
                            <h3 className="text-xs uppercase text-primary mb-1">JOB TITLE</h3>
                            {isEditMode ? (
                                <div>
                                    <input
                                        type="text"
                                        value={formData['Job Title'] as string || ''}
                                        onChange={e => handleInputChange('Job Title', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md p-2 bg-white"
                                    />
                                </div>
                            ) : (
                                <div className="text-gray-800">{contact['Job Title'] || '-'}</div>
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
                                        className="w-full border border-gray-300 rounded-md p-2 bg-white"
                                        placeholder="www.placeholder.com"
                                    />
                                </div>
                            ) : (
                                <div>
                                    {contact.Website ? (
                                        <a
                                            href={contact.Website.toString().startsWith('http') 
                                                ? contact.Website.toString() 
                                                : `https://${contact.Website}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:text-primary/80 hover:underline"
                                        >
                                            {contact.Website}
                                        </a>
                                    ) : '-'}
                                </div>
                            )}
                        </div>

                        {/* LinkedIn */}
                        <div className="col-span-1">
                            <h3 className="text-xs uppercase text-primary mb-1">LINKED IN PROFILE</h3>
                            {isEditMode ? (
                                <div>
                                    <input
                                        type="text"
                                        value={formData.LinkedIn as string || ''}
                                        onChange={e => handleInputChange('LinkedIn', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md p-2 bg-white"
                                    />
                                </div>
                            ) : (
                                <div>
                                    {contact.LinkedIn ? (
                                        <a
                                            href={contact.LinkedIn as string}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:text-primary/80 hover:underline"
                                        >
                                            {contact.LinkedIn}
                                        </a>
                                    ) : '-'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section 2: Address Information */}
                <div className="mb-6">
                    <div className="grid grid-cols-2 gap-x-16 gap-y-6">
                        {/* Address */}
                        <div className="col-span-1">
                            <h3 className="text-xs uppercase text-primary mb-1">ADDRESS</h3>
                            {isEditMode ? (
                                <div>
                                    <input
                                        type="text"
                                        value={formData.Address as string || ''}
                                        onChange={e => handleInputChange('Address', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md p-2 bg-white"
                                    />
                                </div>
                            ) : (
                                <div className="text-gray-800">{contact.Address || '-'}</div>
                            )}
                        </div>

                        {/* City */}
                        <div className="col-span-1">
                            <h3 className="text-xs uppercase text-primary mb-1">CITY</h3>
                            {isEditMode ? (
                                <div>
                                    <input
                                        type="text"
                                        value={formData.City as string || ''}
                                        onChange={e => handleInputChange('City', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md p-2 bg-white"
                                    />
                                </div>
                            ) : (
                                <div className="text-gray-800">{contact.City || '-'}</div>
                            )}
                        </div>

                        {/* State/Province */}
                        <div className="col-span-1">
                            <h3 className="text-xs uppercase text-primary mb-1">STATE/PROVINCE</h3>
                            {isEditMode ? (
                                <div>
                                    <input
                                        type="text"
                                        value={formData['State/Province'] as string || ''}
                                        onChange={e => handleInputChange('State/Province', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md p-2 bg-white"
                                    />
                                </div>
                            ) : (
                                <div className="text-gray-800">{contact['State/Province'] || '-'}</div>
                            )}
                        </div>

                        {/* Country */}
                        <div className="col-span-1">
                            <h3 className="text-xs uppercase text-primary mb-1">COUNTRY</h3>
                            {isEditMode ? (
                                <div>
                                    <input
                                        type="text"
                                        value={formData.Country as string || ''}
                                        onChange={e => handleInputChange('Country', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md p-2 bg-white"
                                    />
                                </div>
                            ) : (
                                <div className="text-gray-800">{contact.Country || '-'}</div>
                            )}
                        </div>

                        {/* Timezone */}
                        <div className="col-span-1">
                            <h3 className="text-xs uppercase text-primary mb-1">TIMEZONE</h3>
                            {isEditMode ? (
                                <div>
                                    <input
                                        type="text"
                                        value={formData.Timezone as string || ''}
                                        onChange={e => handleInputChange('Timezone', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md p-2 bg-white"
                                    />
                                </div>
                            ) : (
                                <div className="text-gray-800">{contact.Timezone || '-'}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section 3: Additional Information */}
                <div className="mb-6">
                    <div className="grid grid-cols-3 gap-x-8 gap-y-6">
                        {/* Row 1: Notes and Preferred Contact Method */}
                        {/* Notes */}
                        <div className="col-span-2">
                            <h3 className="text-xs uppercase text-primary mb-1">NOTE</h3>
                            {isEditMode ? (
                                <div>
                                    <textarea
                                        value={formData.Notes as string || ''}
                                        onChange={e => handleInputChange('Notes', e.target.value)}
                                        className="w-full border border-gray-300 rounded-md p-2 min-h-[100px] bg-white"
                                        rows={4}
                                    />
                                </div>
                            ) : (
                                <div className="text-gray-800 whitespace-pre-wrap">{contact.Notes || '-'}</div>
                            )}
                        </div>

                        {/* Preferred Contact Method */}
                        <div className="col-span-1">
                            <h3 className="text-xs uppercase text-primary mb-1">PREFERRED CONTACT METHOD</h3>
                            {isEditMode ? (
                                <div className="relative">
                                    <select
                                        value={formData['Preferred Contact Method'] as string || ''}
                                        onChange={e => handleInputChange('Preferred Contact Method', e.target.value)}
                                        className="w-full appearance-none border border-gray-300 rounded-md p-2 pr-8 bg-white"
                                    >
                                        {preferredContactMethods.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                        <Iconify icon="tabler:chevron-down" className="w-5 h-5 text-gray-500" />
                                    </div>
                                </div>
                            ) : (
                                <div className="text-gray-800">{contact['Preferred Contact Method'] || '-'}</div>
                            )}
                        </div>

                        {/* Row 2: Date Created and Date Modified */}
                        {/* Date Created */}
                        <div className="col-span-2">
                            <h3 className="text-xs uppercase text-primary mb-1">DATE CREATED</h3>
                            <div className="text-gray-800">
                                {contact.Created ? formatDate(new Date(contact.Created as string), 'MM/dd/yyyy') : '-'}
                            </div>
                        </div>

                        {/* Date Modified */}
                        <div className="col-span-1">
                            <h3 className="text-xs uppercase text-primary mb-1">DATE MODIFIED</h3>
                            <div className="text-gray-800">
                                {contact['Last Modified'] ? formatDate(new Date(contact['Last Modified'] as string), 'MM/dd/yyyy') : '-'}
                            </div>
                        </div>
                    </div>
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

export default ContactDetails; 