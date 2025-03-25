export const formatCurrency = (value: number | string): string => {
    if (!value) return '$0';
    return `$${Number(value).toLocaleString()}`;
}; 