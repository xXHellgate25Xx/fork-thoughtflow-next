import {
  pluginHeadings,
  RicosViewer,
  pluginImageViewer,
  pluginLinkViewer,
  pluginTextHighlightViewer,
  pluginTextColorViewer,
  fromDraft,
} from '@wix/ricos';

function Viewer({ content }: { content: any }) {
  return (
    <>
      <RicosViewer
        content={fromDraft(content)}
        // content={draftcon}
        plugins={[
          pluginImageViewer(),
          pluginTextColorViewer(),
          pluginTextHighlightViewer(),
          pluginHeadings(),
          pluginLinkViewer(),
        ]}
      />
    </>
  );
}

export default Viewer;
