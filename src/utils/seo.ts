export const handleSeoSlugChange = (
  e: React.ChangeEvent<any>,
  setState: React.Dispatch<React.SetStateAction<string>>
) => {
  const inputValue = e.target.value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  setState(inputValue);
};

export const handleKeyDown = (
  e: React.KeyboardEvent<any>,
  setState: React.Dispatch<React.SetStateAction<string>>
) => {
  if (e.key === ' ') {
    e.preventDefault();
    setState((prevValue) => {
      const newValue = prevValue.replace(/-+$/, '');
      return `${newValue}-`;
    });
  }
};
