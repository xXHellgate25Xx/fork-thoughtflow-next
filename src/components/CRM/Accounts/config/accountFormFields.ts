import { AccountsRecord } from "src/types/mapAirtableTypes";
import type { FieldDef } from "../../Modals/types";

// Common form fields configuration for Accounts
export const accountFields: FieldDef<Partial<AccountsRecord>>[] = [
    // Basic Information
    {
        name: "Name",
        label: "Account Name",
        type: "text",
        required: true,
    },
    {
        name: "Priority",
        label: "Priority",
        type: "select",
        options: {
            "High": "High",
            "Medium": "Medium",
            "Low": "Low",
        },
        required: true,
    },
    {
        name: "Industry",
        label: "Industry",
        type: "text",
    },
    {
        name: "Website",
        label: "Website",
        type: "text",
    },
    {
        name: "Research",
        label: "Research",
        type: "text",
    },
    {
        name: "Account Lead Source ",
        label: "Lead Source",
        type: "text",
    },
    // Dates
    {
        name: "Created",
        label: "Created",
        type: "date",
        disabled: true,
    },
    {
        name: "Last Modified",
        label: "Last Modified",
        type: "date",
        disabled: true,
    },
];
