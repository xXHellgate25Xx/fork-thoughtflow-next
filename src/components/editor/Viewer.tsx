import {
  RicosViewer,
  pluginHeadings,
  pluginImageViewer,
  pluginLinkViewer,
  pluginTextColorViewer,
  pluginTextHighlightViewer,
} from '@wix/ricos';

function Viewer({ content }: { content: any }) {
  return (
    <RicosViewer
        content={content}
        // content={draftcon}
        plugins={[
          pluginImageViewer({disableExpand: true, disableTransition: true, imageProps(src) {
            // console.log(src)
            return new Image()
          },
        }),
        pluginTextColorViewer(),
        pluginTextHighlightViewer(),
        pluginHeadings(),
        pluginLinkViewer(),
      ]}
    />
  );
}

export default Viewer;
