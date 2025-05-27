import type { ButtonProps } from '@mui/material/Button';

import { GenericMenuDropdown } from 'src/components/selector/generic-menu-dropdown';


// ----------------------------------------------------------------------

type ModelSelectProps = ButtonProps & {
  modelId: string;
  onSort: (newSort: string) => void;
  options: { id: string; name: string }[] | undefined;
};

export function ModelSelect({ modelId: channelId, onSort, options, sx, ...other }: ModelSelectProps) {

  return (
    <GenericMenuDropdown
        selectedId={channelId}
        label='Model'
        onSort={onSort}
        options={options}
        sx={sx}
        {...other}
      />
  );
}
