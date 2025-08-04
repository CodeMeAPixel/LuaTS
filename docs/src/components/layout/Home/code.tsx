"use client";

import React from 'react';
import { 
  MousePointerClick, 
  PanelTopDashed, 
  SquareMenu, 
  SquareSlash,
  ExternalLink 
} from 'lucide-react';
import { CodeBlock } from '../global/codeblock';

interface CardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, description, href, icon, children }) => {
  return (
    <div className="flex-1 border-b border-gray-700/50 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0">
      <div className="p-6 lg:p-8 h-full">
        <div className="flex items-start gap-3 mb-4">
          <div className="text-gray-400 mt-1">
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white underline">{title}</h3>
              <ExternalLink className="w-4 h-4 text-gray-500" />
            </div>
            <p className="text-gray-400 text-sm mb-6">{description}</p>
          </div>
        </div>
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  );
};

const Separator: React.FC = () => {
  return <div className="h-px w-full bg-gray-700/50" />;
};

interface SectionTitleProps {
  content: React.ReactNode;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ content }) => {
  return (
    <section className="relative flex w-full items-center justify-center overflow-hidden bg-gradient-to-b from-gray-900/50 to-gray-950 py-12 lg:py-16">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-transparent"></div>
      <h2 className="relative z-10 text-3xl font-bold text-white sm:text-4xl md:text-5xl lg:text-6xl">
        {content}
      </h2>
    </section>
  );
};

const QuickExample = `import { generateTypes } from 'luats';

const tsCode = generateTypes(\`
  type Vector3 = {
    x: number,
    y: number,
    z: number
  }
\`);

console.log(tsCode);
// Output:
// interface Vector3 {
//   x: number;
//   y: number;
//   z: number;
// }`;

const basicUsage = `import { parseLuau } from 'luats';
// or import the class directly  
import { LuauParser } from 'luats/parsers/luau';

// Parse Luau code with type annotations
const ast = parseLuau(\`
  type Person = {
    name: string,
    age: number,
    active?: boolean
  }
 
  local function createPerson(name: string, age: number): Person
    return {
      name = name,
      age = age,
      active = true
    }
  end
\`);

console.log(ast);`;

const FormattingLuaCode = `import { formatLua } from 'luats';
import { LuaFormatter } from 'luats/clients/formatter';

// Using convenience function
const messyCode = "local x=1+2 local y=x*3 if x>5 then print(\\"big\\") end";
const formatted = formatLua(messyCode);

// Using class with custom options
const formatter = new LuaFormatter({
  indentSize: 4,
  insertSpaceAroundOperators: true,
  insertSpaceAfterComma: true,
  maxLineLength: 100
});

const customFormatted = formatter.format(messyCode);`;

const lexerCode = `import { Lexer, TokenType } from 'luats/clients/lexer';

const lexer = new Lexer(\`
  local name: string = "World"
  print("Hello, " .. name)
\`);

const tokens = lexer.tokenize();

tokens.forEach(token => {
  console.log(\`\${token.type}: "\${token.value}" at \${token.line}:\${token.column}\`);
});`;

export default function HomeBuilders() {
  return (
    <div className="w-full text-white min-h-screen">
      <SectionTitle content="Examples" />
      
      <section className="flex w-full flex-col lg:flex-row border-t border-gray-700/50">
        <Card
          title="Quick Example"
          description="QuickExample on using lua to ts"
          href="/docs/builders/slash"
          icon={<SquareSlash className="size-5" />}
        >
          <CodeBlock lang="js" code={QuickExample} />
        </Card>
        
        <Card
          title="Basic Usage"
          description="basic usage for parsing luau/lua code (with Types)"
          href="/docs/builders/context-menu"
          icon={<PanelTopDashed className="size-5" />}
        >
          <CodeBlock lang="js" code={basicUsage} />
        </Card>
      </section>
      
      <Separator />
      
      <SectionTitle content="Components" />
      
      <section className="flex w-full flex-col lg:flex-row border-t border-gray-700/50">
        <Card
          title="Formatting Lua Code"
          description="Guide to formatting your luau/lua code"
          href="/docs/builders/button"
          icon={<MousePointerClick className="size-5" />}
        >
          <CodeBlock lang="js" code={FormattingLuaCode} />
        </Card>
        
        <Card
          title="Working with the Lexer"
          description="How to guide on using Lexer patterns"
          href="/docs/builders/modal"
          icon={<SquareMenu className="size-5" />}
        >
          <CodeBlock lang="js" code={lexerCode} />
        </Card>
      </section>
      
      <Separator />
    </div>
  );
}