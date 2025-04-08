// lib/markdownUtils.ts
import { marked } from "marked";
import DOMPurify from "dompurify";
import TurndownService from "turndown";

const turndownService = new TurndownService({
    'headingStyle': 'atx',
    'bulletListMarker': '-',
    'emDelimiter': '*'
  });

// Fix: Add spacing after bold questions in Markdown
turndownService.addRule('strongFix', {
filter: 'strong',
replacement(inner: any) {
    const clean = inner.replace(/\\\./g, '.'); // remove backslash from 1\. etc
    return `**${clean}** `;
},
});

// Fix: Preserve paragraph spacing
turndownService.addRule('paragraphSpacing', {
filter: 'p',
replacement(inner: any) {
    return `\n\n${inner}\n\n`;
},
});

export const mdToHtml = (markdown: string) => DOMPurify.sanitize(marked(markdown).toString());
export const htmlToMd = (html: string) => turndownService.turndown(DOMPurify.sanitize(html));

