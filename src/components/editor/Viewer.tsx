import { useEffect, useRef, useState } from 'react';
import { RicosViewer } from 'ricos-viewer';
import { pluginImage } from 'wix-rich-content-plugin-image';
import { pluginTextColor, pluginTextHighlight } from 'wix-rich-content-plugin-text-color';
import { pluginHeadings } from "wix-rich-content-plugin-headings";
import { pluginLink } from "wix-rich-content-plugin-link";

function Viewer({content}:{content: any}) {

    // console.log((content))
    
    return (
        <>
        <RicosViewer
        content={content}
        // content={draftcon}
        plugins={[pluginImage(), pluginTextColor(), pluginTextHighlight(), pluginHeadings(), pluginLink()]} 
        />
        </>
    )
}

export default Viewer;