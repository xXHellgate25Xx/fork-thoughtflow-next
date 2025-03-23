import type { Node, TextData, LinkData, Decoration, RichContent} from "ricos-schema";

import { Node_Type, Decoration_Type } from "ricos-schema";

export const handleSeoSlugChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  setState: React.Dispatch<React.SetStateAction<string>>,
  cursorRef: React.MutableRefObject<number>
) => {
  const input = e.target;
  const cursorPos = input.selectionStart ?? 0; // Capture cursor position before modifying text

  // Transform value
  const transformedValue = input.value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Remove consecutive hyphens

  // Adjust cursor position for deletions
  if (transformedValue.length < input.value.length) {
    cursorRef.current = Math.max(cursorPos - 1, 0);
  } else {
    cursorRef.current = cursorPos;
  }

  setState(transformedValue);
};


export const handleKeyDown = (
  e: React.KeyboardEvent<any>,
  setState: React.Dispatch<React.SetStateAction<string>>,
  cursorRef: React.MutableRefObject<number>
) => {
  if (e.key === ' ') {
    e.preventDefault();
    // Get the current cursor position
    const input = e.target as HTMLInputElement | HTMLTextAreaElement;
    const cursorPos = input.selectionStart ?? 0;

    setState((prevValue) => {
      let newValue = prevValue.replace(/-+$/, ''); // Remove trailing hyphens
      newValue = `${newValue}-`;

      // Update cursor position based on transformation
      cursorRef.current = cursorPos + (newValue.length - prevValue.length);
      return newValue;
    });
  }
};

type ExtractedText = {
  type: string;
  headingLevel?: string;
  text: string;
  decorations: string[];
};

// Extract text decorations (bold, italic, underline, etc.)
function extractDecorations(textData: TextData): string[] {
  return textData.decorations?.map(decorationToString) ?? [];
}

// Convert Decoration Enum to Readable Format
function decorationToString(decoration: Decoration): string {
  switch (decoration.type) {
    case Decoration_Type.BOLD:
      return "BOLD";
    case Decoration_Type.ITALIC:
      return "ITALIC";
    case Decoration_Type.UNDERLINE:
      return "UNDERLINE";
    case Decoration_Type.COLOR:
      return `COLOR(${decoration.colorData?.foreground ?? "unknown"})`;
    case Decoration_Type.LINK:
      return `LINK(${getLinkUrl(decoration.linkData)})`;
    case Decoration_Type.MENTION:
      return `MENTION(${decoration.mentionData?.name ?? "unknown"})`;
    case Decoration_Type.SPOILER:
      return "SPOILER";
    default:
      return decoration.type;
  }
}

// Fix for missing 'url' in LinkData
function getLinkUrl(linkData?: LinkData): string {
  return linkData && "link" in linkData ? (linkData as any).link : "unknown";
}

function extractTextData(content: RichContent): ExtractedText[] {
  const extracted: ExtractedText[] = [];

  content.nodes.forEach((node: Node) => {
    const nodeType = node.type;
    let headingLevel: string | undefined;

    // Handle Headings (h1, h2, h3, etc.)
    if (nodeType === Node_Type.HEADING && node.headingData) {
      headingLevel = `h${node.headingData.level}`;
    }

    // Process Child Nodes (Text Content)
    node.nodes?.forEach(subNode => {
      if (subNode.textData) {
        extracted.push({
          type: nodeType,
          headingLevel,
          text: subNode.textData.text,
          decorations: extractDecorations(subNode.textData),
        });
      }
    });
  });

  return extracted;
}

const checkFocusKeyH1 = (
  title: string,
  focus_keyword: string
) => {
  const has_focus_in_title = title.toLowerCase().includes(focus_keyword.toLowerCase());
  return has_focus_in_title;
}

const hasFocusKeyBody = (
  rich_content: RichContent,
  focus_keyword: string
) => {
  const extractedData = extractTextData(rich_content);
  const has_focus_key_in_body = extractedData.some(
    (item) =>
      item.type === Node_Type.PARAGRAPH &&
      item.text.toLowerCase().includes(focus_keyword.toLowerCase())
  );
  
  return has_focus_key_in_body
}

const checkImage = (node: Node): boolean => {
  if (node.type === Node_Type.IMAGE) {
    return true;
  }
  // // Check nested nodes recursively (No need because Image is separated from Paragraphs but commented incase Wix changes it's format)
  // return node.nodes?.some(checkImage) ?? false;
  return false;
}

const hasImage = (rich_content: RichContent): boolean => 
  rich_content.nodes.some(checkImage);

const checkImageAltText = (node: Node): boolean => {
  if (node.type === Node_Type.IMAGE && node.imageData?.altText !== "") {
    return true;
  }
  // // Check nested nodes recursively (No need because Image is separated from Paragraphs but commented incase Wix changes it's format)
  // return node.nodes?.some(checkImage) ?? false;
  return false;
}

const hasImageAltText = (rich_content: RichContent): boolean => 
  rich_content.nodes.some(checkImageAltText);

const checkFocusKeyTitleTag = (
  title: string,
  focus_keyword: string
) => {
  const has_focus_in_title = title.toLowerCase().includes(focus_keyword.toLowerCase());
  return has_focus_in_title;
}


const hasFocusKeyMetaDescription = (
  seo_meta_description: string,
  focus_keyword: string
) => {
  const has_focus_in_meta = seo_meta_description.toLowerCase().includes(focus_keyword.toLowerCase());
  return has_focus_in_meta;
}

const hasFocusKeyURLSlug = (
  seo_slug: string,
  focus_keyword: string
) => {
    // Normalize keyword: Convert to lowercase, remove 's, and replace non-alphanumeric characters with spaces
    const normalizedKeyword = focus_keyword.toLowerCase().replace(/'s/g, "s").replace(/[^a-z0-9]+/g, " ").trim();
    
    // Normalize slug: Convert to lowercase and replace hyphens with spaces
    const normalizedSlug = seo_slug.toLowerCase().replace(/-/g, " ").trim();
    
    // Check if the keyword exists as a contiguous substring in the slug
    return normalizedSlug.includes(normalizedKeyword);
}

export const checkSEO = (
  checklist: string[],
  rich_content: RichContent,
  title: string,
  seo_title_tag: string,
  seo_meta_description: string,
  seo_slug: string,
  long_tail_keyword: string
) => {
  const return_checklist: string[] = [];

  if (checkFocusKeyTitleTag(seo_title_tag,long_tail_keyword) && long_tail_keyword !== "") {
    return_checklist.push(checklist[0]);
  }

  if (checkFocusKeyH1(title, long_tail_keyword) && long_tail_keyword !== "") {
    return_checklist.push(checklist[1]);
  }

  if (hasImage(rich_content)) {
    return_checklist.push(checklist[2]);
  }

  if (hasImageAltText(rich_content)) {
    return_checklist.push(checklist[3]);
  }

  if (hasFocusKeyBody(rich_content, long_tail_keyword) && long_tail_keyword !== "") {
    return_checklist.push(checklist[4]);
  }

  if (hasFocusKeyMetaDescription(seo_meta_description, long_tail_keyword) && long_tail_keyword !== "") {
    return_checklist.push(checklist[5]);
  }

  if (hasFocusKeyURLSlug(seo_slug, long_tail_keyword) && long_tail_keyword !== "") {
    return_checklist.push(checklist[6]);
  }

  return return_checklist;
};
