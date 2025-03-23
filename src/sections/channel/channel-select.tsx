import type { ButtonProps } from '@mui/material/Button';

import { GenericMenuDropdown } from 'src/components/selector/generic-menu-dropdown';


// ----------------------------------------------------------------------

type ChannelSelectProps = ButtonProps & {
  channelId: string;
  onSort: (newSort: string) => void;
  options: { id: string; name: string }[] | undefined;
};

export function ChannelSelect({ channelId, onSort, options, sx, ...other }: ChannelSelectProps) {

  return (
    <GenericMenuDropdown
        selectedId={channelId}
        label='Content Channel'
        onSort={onSort}
        options={options}
        sx={sx}
        {...other}
      />
  );
}
