import { EditorState, RichContentEditor } from 'wix-rich-content-editor';
import { RicosEditor } from 'ricos-editor';
import { pluginImage } from 'wix-rich-content-plugin-image';

function Editor() {
  return (
    <>
      <RicosEditor toolbarSettings={{useStaticTextToolbar:true}}/>
    </>
  );
}

export default Editor;
