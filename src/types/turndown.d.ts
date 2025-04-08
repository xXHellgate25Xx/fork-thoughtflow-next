declare module 'turndown' {
    class TurndownService {
      constructor(options?: any);
      turndown(input: string): string;
      addRule(name: string, rule: any): void;
    }
  
    export default TurndownService;
  }
  