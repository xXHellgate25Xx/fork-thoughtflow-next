import { format } from "date-fns";

const getFormattedDate = (date: Date) => format(new Date(date), 'MM/dd/yyyy')

const getFormattedDateTime = (date: Date) => format(new Date(date), 'MM/dd/yyyy HH:mm')

const formatDateISO = (value: string) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toISOString().split('T')[0];
};

export { formatDateISO, getFormattedDate, getFormattedDateTime };

