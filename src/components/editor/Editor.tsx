import { useEffect, useRef, useState } from 'react';
import { IMAGE_TYPE } from 'ricos-content';
import { RicosEditor } from 'ricos-editor';
import { EditorCommands } from 'ricos-types';
import { useUploadToWixMutation } from 'src/libs/service/wix/wix';
import { toBase64 } from 'src/utils/encodeFileToBase64';
import { processingFilePath } from 'src/utils/file-path-with-hash';
import { pluginImage } from 'wix-rich-content-plugin-image';
import { pluginTextColor, pluginTextHighlight } from 'wix-rich-content-plugin-text-color';
import { pluginHeadings } from "wix-rich-content-plugin-headings";
import { pluginLink } from "wix-rich-content-plugin-link";

import { fromDraft } from 'ricos-content/libs/fromDraft';
import { RichContent } from 'ricos-schema';

function Editor({content,callback, channel_id} : {content?: any, callback?: any, channel_id?: any}) {
  const [editorState, setEditorState] = useState(JSON.parse(content));
  const editorRef = useRef<EditorCommands | null>(null);

  const [uploadToWix] = useUploadToWixMutation();

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
                width: 750, // Current default
                height: 500,
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

  // useEffect(() => {
  //   console.log(content);
  //   console.log("EditorState: ");
  //   console.log(editorState);
  // }, [editorState]);

  return (
    <>
      <RicosEditor
        toolbarSettings={{ useStaticTextToolbar: true }}
        content={editorState}
        onChange={(updatedContent: any) => {
          setEditorState(updatedContent);
          callback((updatedContent))
        }}
        ref={(ref: any) => {
          editorRef.current = ref?.getEditorCommands() || null;
        }} // Save editor commands using ref
        plugins={[pluginImage(), 
          pluginTextColor(), 
          pluginTextHighlight(), 
          pluginHeadings(), 
          pluginLink()
        ]} // Add plugins if needed
      />
      <button
        type="button"
        onClick={addCustomImage}
        style={{ marginTop: '10px', padding: '8px 16px' }}
      >
        Add Custom Image
      </button>
    </>
  );
}

export default Editor;
