import { Icon } from '@iconify/react';
import { useEffect, useRef, useState } from 'react';
import './editor.css';

import { IMAGE_TYPE, pluginHeadings, pluginImage, pluginLink, pluginTextColor, pluginTextHighlight, RicosEditor } from '@wix/ricos';
import type { PublicCommands } from '@wix/ricos/dist/src/ricos-types';

import { Button, CircularProgress } from '@mui/material';

import { toBase64 } from 'src/utils/encodeFileToBase64';
import { processingFilePath } from 'src/utils/file-path-with-hash';

import { useUploadToSupabaseMutation, useUploadToWixMutation } from 'src/libs/service/wix/wix';


function Editor({ content, callback, channel_id, content_id }: { content?: any, callback?: any, channel_id?: any, content_id?: any }) {
  const isInitialMount = useRef(true);
  const [editorState, setEditorState] = useState(content);
  const editorRef = useRef<PublicCommands | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [uploadToWix] = useUploadToWixMutation();
  const [uploadToSupabase] = useUploadToSupabaseMutation();

  useEffect(() => {
    // Make sure we're not overriding user edits after initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (content !== undefined && JSON.stringify(content) !== JSON.stringify(editorState)) {
      setEditorState(content);
    }
  }, [content]);

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
            channelId: channel_id,
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


            const { width: imgWidth, height: imgHeight } = await getImageSize(file)


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
          setIsLoading(true);
          const bucketName = 'content_media';
          const pathName = await processingFilePath(file, content_id, file.name.split('.')[0]);

          const encodedFile = await toBase64(file);
          const response = await uploadToSupabase({
            channelId: channel_id,
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


            const { width: imgWidth, height: imgHeight } = await getImageSize(file)

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
            setIsLoading(false);
          } else {
            console.error('Upload failed:', response.error);
            setIsLoading(false);
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          setIsLoading(false);
        }
      }
    };
    input.click(); // Trigger the file picker
  };

  return (
    <>
      <div className="editor-container">
        <RicosEditor
          content={editorState}
          onChange={(updatedContent: any) => {
            setEditorState(updatedContent);
            if (JSON.stringify(updatedContent) !== JSON.stringify(content)) {
              callback(updatedContent);
            }
          }}
          ref={(ref: any) => {
            editorRef.current = ref?.getEditorCommands() || null;
          }}
          plugins={[
            pluginImage(),
            pluginTextColor(),
            pluginTextHighlight(),
            pluginHeadings(),
            pluginLink()
          ]}
          key={JSON.stringify(content)?.substring(0, 50)}
        />
      </div>

      <Button
        variant='contained'
        color='inherit'
        onClick={addCustomImageNoWix}
        disabled={isLoading}
        startIcon={
          isLoading ? <CircularProgress size={24} /> : <Icon icon="mdi:camera" />
        }
        sx={{ mt: '1rem' }}
      >
        Add Image
      </Button>
    </>
  );
}

export default Editor;
