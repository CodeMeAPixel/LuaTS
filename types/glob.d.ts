declare module 'glob' {
  function glob(
    pattern: string, 
    options: glob.IOptions, 
    cb: (err: Error | null, matches: string[]) => void
  ): void;
  
  namespace glob {
    interface IOptions {
      cwd?: string;
      absolute?: boolean;
      dot?: boolean;
      nobrace?: boolean;
      noglobstar?: boolean;
      noext?: boolean;
      nocase?: boolean;
      matchBase?: boolean;
      nodir?: boolean;
      ignore?: string | string[];
      follow?: boolean;
      realpath?: boolean;
      nonull?: boolean;
      mark?: boolean;
      nosort?: boolean;
      stat?: boolean;
      silent?: boolean;
      debug?: boolean;
      [key: string]: any;
    }
  }
  
  export = glob;
}
