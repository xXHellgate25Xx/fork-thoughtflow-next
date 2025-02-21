export const handleSeoSlugChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  setState: React.Dispatch<React.SetStateAction<string>>,
  cursorRef: React.MutableRefObject<number>
) => {
  const input = e.target;
  const cursorPos = input.selectionStart ?? 0; // Capture cursor position before modifying text

  // Transform value
  const transformedValue = input.value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Remove consecutive hyphens

  // Adjust cursor position for deletions
  if (transformedValue.length < input.value.length) {
    cursorRef.current = Math.max(cursorPos - 1, 0);
  } else {
    cursorRef.current = cursorPos;
  }

  setState(transformedValue);
};


export const handleKeyDown = (
  e: React.KeyboardEvent<any>,
  setState: React.Dispatch<React.SetStateAction<string>>,
  cursorRef: React.MutableRefObject<number>
) => {
  if (e.key === ' ') {
    e.preventDefault();
    // Get the current cursor position
    const input = e.target as HTMLInputElement | HTMLTextAreaElement;
    const cursorPos = input.selectionStart ?? 0;

    setState((prevValue) => {
      let newValue = prevValue.replace(/-+$/, ''); // Remove trailing hyphens
      newValue = `${newValue}-`;

      // Update cursor position based on transformation
      cursorRef.current = cursorPos + (newValue.length - prevValue.length);
      return newValue;
    });
  }
};
