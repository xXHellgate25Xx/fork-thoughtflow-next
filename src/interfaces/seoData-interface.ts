export interface Tags {
    type?: 'title' | 'meta' | 'link' | 'script';
    prop?: { [key: string]: string }; // struct type
    meta?: { [key: string]: string };
    children?: string;
    custom?: boolean;
    disable?: boolean;
  }
  
  export interface Keywords {
    term?: string;
    isMain?: boolean;
    origin?: string;
  }
  
  export interface Settings {
    preventAutoRedirect?: boolean;
    keywords?: Keywords[];
  }
  
  export interface SeoData {
    tags: Tags[];
    setting: Settings;
  }
  
  export function createTitleTag(title: string): Tags {
    return {
      type: 'title',
      children: title,
    };
  }
  
  export function createMetaDescriptionTag(description: string): Tags {
    return {
      type: 'meta',
      prop: { name: 'description', content: description },
      children: description,

    };
  }
  