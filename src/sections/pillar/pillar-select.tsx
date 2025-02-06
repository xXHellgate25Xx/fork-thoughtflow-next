import type { ButtonProps } from '@mui/material/Button';
import { GenericMenuDropdown } from 'src/components/selector/generic-menu-dropdown';
// ----------------------------------------------------------------------

type PillarSelectProps = ButtonProps & {
  pillarId: string;
  onSort: (newSort: string) => void;
  options: { id: string; name: string }[] | undefined;
};

export function PillarSelect({ options, pillarId, onSort, sx, ...other }: PillarSelectProps) {
  return (
    <>
      <GenericMenuDropdown
        selectedId={pillarId}
        label='Content Pillar'
        onSort={onSort}
        options={options}
        sx={sx}
        {...other}
      />
    </>
  );
}
