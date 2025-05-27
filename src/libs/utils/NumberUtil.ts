const formatNumber = (value: string) => {
    if (!value) return '';
    const num = Number(value.replace(/,/g, ''));
    if (Number.isNaN(num)) return value;
    return num.toLocaleString();
};

export { formatNumber };

