import React from 'react';
import {
    Box,
    Card,
    CardActionArea,
    Typography,
} from '@mui/material';

interface TagProps {
    tagList: Array<{tagLabel: string; tagValue: string}>;
    onTagSelect: (tag: {tagLabel: string; tagValue: string}) => void;
}

export function TagsPicker({tagList, onTagSelect}: TagProps) {
    return (
        <Box sx={{ mt : 1}}>
            <Typography variant='h6' sx={{mb: 2}}>Available Variables</Typography>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 1
                }}
            >   
            
                {tagList.map((tag, index)=>(
                    <Card
                        key={index}
                        sx={{
                            textAlign: "center",
                            backgroundColor: "rgb(157, 155, 155)",
                            borderRadius: 1,
                            p: 1
                        }}
                        onClick={() => onTagSelect(tag)}
                    >
                        <CardActionArea>
                            <Typography>{`{{${tag.tagLabel}}}`}</Typography>
                        </CardActionArea>
                    </Card>
                ))}
            </Box>
        </Box>
    )
}