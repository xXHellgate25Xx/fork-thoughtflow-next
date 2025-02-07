import { Box, SxProps, TextField as MUITextField, Typography, TextFieldProps } from '@mui/material';

function TextField({ label, required, ...props }: { label?: string } & TextFieldProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width:'100%'} as SxProps}>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.2 } as SxProps}>
        <Typography>{label}</Typography>
        {required && <Typography sx={{ color: 'red' }}>*</Typography>}
      </Box>

      <MUITextField {...props} />
    </Box>
  );
}

export default TextField;
