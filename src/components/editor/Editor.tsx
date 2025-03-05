import { useEffect, useRef, useState } from 'react';
import { IMAGE_TYPE } from 'ricos-content';
import { RicosEditor } from 'ricos-editor';
import { EditorCommands } from 'ricos-types';
import { useUploadToWixMutation, useUploadToSupabaseMutation } from 'src/libs/service/wix/wix';
import { toBase64 } from 'src/utils/encodeFileToBase64';
import { processingFilePath } from 'src/utils/file-path-with-hash';
import { pluginImage } from 'wix-rich-content-plugin-image';
import { pluginTextColor, pluginTextHighlight } from 'wix-rich-content-plugin-text-color';
import { pluginHeadings } from "wix-rich-content-plugin-headings";
import { pluginLink } from "wix-rich-content-plugin-link";

import { fromDraft } from 'ricos-content/libs/fromDraft';
import { RichContent } from 'ricos-schema';
import { Button } from '@mui/material';
import { Icon } from '@iconify/react';

function Editor({content,callback, channel_id, content_id} : {content?: any, callback?: any, channel_id?: any, content_id?: any}) {
  const [editorState, setEditorState] = useState(content);
  const editorRef = useRef<EditorCommands | null>(null);

  const [uploadToWix] = useUploadToWixMutation();
  const [uploadToSupabase] = useUploadToSupabaseMutation();


  const getImageSize = (file: File): Promise<{ width: number; height: number }> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
  
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(objectUrl); // Cleanup
      };
  
      img.onerror = () => {
        reject(new Error('Failed to load image'));
        URL.revokeObjectURL(objectUrl); // Cleanup in case of error
      };
  
      img.src = objectUrl;
    });


  const addCustomImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event: Event) => {
      const file = (event.target as HTMLInputElement)?.files?.[0];
      if (file) {
        try {
          const bucketName = 'media';
          const pathName = await processingFilePath(file, 'images', file.name.split('.')[0]);

          const encodedFile = await toBase64(file);
          const response = await uploadToWix({
            channelId : channel_id,
            fileData: {
              bucketName,
              file: encodedFile,
              destinationPath: pathName,
              displayName: file.name,
              contentType: file.type,
            }
          });
          if (response.data) {
            const wixData = response.data;

            const editorCommands = editorRef.current;
            if (!editorCommands) {
              console.error('Editor commands are not available');
              return;
            }


            const {width: imgWidth, height: imgHeight} = await getImageSize(file)


            const imageData = {
              containerData: {
                alignment: 'CENTER',
                width: {
                  size: 'CONTENT',
                },
                textWrap: true,
              },
              image: {
                src: {
                  id: wixData.file.id,
                },
                width: imgWidth, // Current default
                height: imgHeight,
              },
              altText: wixData.file.displayName,
            };
            setTimeout(() => { // Wait for wix to have image
              editorCommands.insertBlock(IMAGE_TYPE, imageData);
            }, 1000);
          } else {
            console.error('Upload failed:', response.error);
          }
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }
    };
    input.click(); // Trigger the file picker
  };

  const addCustomImageNoWix = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event: Event) => {
      const file = (event.target as HTMLInputElement)?.files?.[0];
      if (file) {
        try {
          const bucketName = 'content_media';
          const pathName = await processingFilePath(file, content_id, file.name.split('.')[0]);

          const encodedFile = await toBase64(file);
          const response = await uploadToSupabase({
            channelId : channel_id,
            fileData: {
              bucketName,
              file: encodedFile,
              destinationPath: pathName,
              displayName: file.name,
              contentType: file.type,
            }
          });

          if (response.data) {
            const supData = response.data;
            const editorCommands = editorRef.current;
            if (!editorCommands) {
              console.error('Editor commands are not available');
              return;
            }


            const {width: imgWidth, height: imgHeight} = await getImageSize(file)

            const imageData = {
              containerData: {
                alignment: 'CENTER',
                width: {
                  size: 'CONTENT',
                },
                textWrap: true,
              },
              image: {
                src: {
                  url: supData.file.publicUrl,
                },
                width: imgWidth, // Current default
                height: imgHeight,
              },
              altText: supData.file.displayName,
            };

            setTimeout(() => { // Wait for wix to have image
              editorCommands.insertBlock(IMAGE_TYPE, imageData);
            }, 1000);
          } else {
            console.error('Upload failed:', response.error);
          }
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }
    };
    input.click(); // Trigger the file picker
  };

  // useEffect(() => {
  //   console.log(content);
  //   console.log("EditorState: ");
  //   console.log(editorState);
  // }, [editorState]);

  return (
    <>
      <RicosEditor
        toolbarSettings={{ useStaticTextToolbar: false }}
        content={editorState}
        onChange={(updatedContent: any) => {
          setEditorState(updatedContent);
          callback((updatedContent))
        }}
        ref={(ref: any) => {
          editorRef.current = ref?.getEditorCommands() || null;
        }} // Save editor commands using ref
        plugins={[
          pluginImage(), 
          pluginTextColor(), 
          pluginTextHighlight(), 
          pluginHeadings(), 
          pluginLink()
        ]} // Add plugins if needed
      />
      <Button
        variant='contained'
        color='inherit'
        // onClick={addCustomImage}
        onClick={addCustomImageNoWix}
        startIcon={<Icon icon='mdi:camera'/>}
        sx={{ mt: '1rem' }}
      >
        Add Image
      </Button>
    </>
  );
}

export default Editor;
