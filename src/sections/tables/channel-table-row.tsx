import type { LabelColor } from 'src/components/label';

import { Icon } from '@iconify/react';
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { 
  Button, 
  Typography,
} from '@mui/material';

import { channelIcons } from 'src/theme/icons/channel-icons';
import { useModifyChannelMutation } from 'src/libs/service/channel/channel';

import { GenericModal } from 'src/components/modal/generic-modal';
// ----------------------------------------------------------------------

export type ChannelProps = {
  id: string;
  type: string;
  name: string;
  url: string;
  prompt: string;
  content: string;
};

type ChannelTableRowProps = {
  row: ChannelProps;
  onChannelSubmit?: () => void;
};

const labelColors: { [key: string]: LabelColor } = {
    published: 'success',
    draft: 'info',
    archived: 'default',
}

export function ChannelTableRow({ row, onChannelSubmit }: ChannelTableRowProps) {
  const [openPopover, setOpenPopover] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [modifyChannel] = useModifyChannelMutation();
  const [promptInput, setPromptInput] = useState<string>('');
  // const [rowDataList, setRowDataList] = useState<{tagLabel: string; tagValue: string}[]>([]);
  // const textFieldRef = useRef<HTMLInputElement | null>(null);

  useEffect(()=>{
    setPromptInput(row.prompt);
    // setRowDataList([
    //   {tagLabel: 'title', tagValue: row.name},
    //   {tagLabel: 'content', tagValue: row.content},
    //   {tagLabel: 'date', tagValue: dayjs().format('YYYY-MM-DD')},
    // ]);
  },[row.prompt]);

  const handleOpenPopover = () => {
    setOpenPopover(true);
  };

  const handleClosePopover = () => {
    setOpenPopover(false);
  };

  // Code-block for variable tags in the channel prompt

  // const handleTagSelection = (tag: {tagLabel: string; tagValue: string}) => {
  //   if(textFieldRef.current) {
  //     const input = textFieldRef.current;
  //     if(input) {
  //       const startPos = input.selectionStart;
  //       const preCursor = promptInput.substring(0, startPos as number);
  //       const posCursor = promptInput.substring(input.selectionEnd as number);

  //       setPromptInput(`${preCursor}{{${tag.tagLabel}}}${posCursor}`);

  //       input.selectionStart = (startPos as number) + `{{${tag.tagLabel}}}`.length;
  //       input.selectionEnd = input.selectionStart;
  //     }
  //   }
  // };

  // const displayTagsPicker: React.ReactNode = (
  //   <TagsPicker
  //     tagList={rowDataList}
  //     onTagSelect={handleTagSelection}
  //   />
  // );

  // Code-block for variable tags in the channel prompt

  const handlePromptSubmit = async (text: string) => {
    setIsSubmitted(true);

    // Code-block to enable dynamic values replacing variable tags in the channel prompt

    // const reg = new RegExp(`${rowDataList.map((tag)=>{
    //   const labels = tag.tagLabel;
    //   return `\\{\\{${labels}\\}\\}`;
    // }).join("|")}`, "g");

    // const promptUpload = promptInput.replace(reg, (matched) => 
    //   rowDataList.find((tag) => matched === `{{${tag.tagLabel}}}`)
    //   ?.tagValue as string);

    // TO-DO: confirm the final design for the variable selection

    await modifyChannel({
      channel_id: row.id,
      payload: {
        name: row.name,
        channel_type: row.type,
        brand_voice_initial: text
      }
    });

    setIsSubmitted(false);
    
    onChannelSubmit?.();
  };

  return (
    <>
      <TableRow hover tabIndex={-1}>
        <TableCell align='center'>
          <Icon icon={channelIcons[row.type]} width='2rem'/>
        </TableCell>

        <TableCell>
          <Box>
            <Typography sx={{ fontWeight: 'bold' }}>
            {row.name}
            </Typography>
            <Typography>
            {row.url}
            </Typography>
          </Box>
        </TableCell>
        <TableCell align='right'>
          <Box display='flex' justifyContent='flex-end' gap='0.5rem'>
            <Button
              variant='outlined'
              color='inherit'
              onClick={handleOpenPopover}
            >
              Edit prompt
            </Button>
            {/* <Button
              variant='contained'
              color='inherit'
            >
              Disconnect
            </Button> */}
          </Box>
        </TableCell>
      </TableRow>

      <GenericModal
        open={openPopover}
        onClose={handleClosePopover}
        setParentText={setPromptInput}
        textFieldValue={promptInput}
        isLoading={isSubmitted}
        onAddItem={handlePromptSubmit}
        modalTitle={`Edit prompt for ${row.name}`}
        modalSubTitle='Customize the prompt for generating content for this channel'
        buttonText='Submit'
        storageTextVarName={`storedText-${row.id}`}
        // customChildren={displayTagsPicker} // Variables selection
        // textInputRef={textFieldRef}
        styling={{
          multiline: true,
          rows: 10,
          enableCloseButton: true
        }}
      />
    </>
  );
}
