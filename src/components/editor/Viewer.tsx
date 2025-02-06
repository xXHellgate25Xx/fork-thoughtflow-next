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
          pluginImageViewer({disableExpand: true}),
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
