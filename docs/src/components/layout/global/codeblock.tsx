'use client';

import { cn } from '@/lib/cn';
import * as Base from 'fumadocs-ui/components/codeblock';
import { Fragment, type HTMLAttributes, useEffect, useState } from 'react';
import { jsx, jsxs } from 'react/jsx-runtime';

export type CodeBlockProps = HTMLAttributes<HTMLPreElement> & {
	code: string;
	wrapper?: Base.CodeBlockProps;
	lang: string;
};

export function CodeBlock({
	code,
	lang,
	wrapper,
	...props
}: CodeBlockProps) {
	const [renderedCode, setRenderedCode] = useState<React.ReactNode>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function renderCode() {
			try {
				// Dynamic import to avoid SSR issues
				const { codeToHast } = await import('shiki');
				const { toJsxRuntime } = await import('hast-util-to-jsx-runtime');

				const hast = await codeToHast(code, {
					lang,
					defaultColor: false,
					themes: {
						light: 'min-light',
						dark: 'github-dark-default',
					},
				});

				const rendered = toJsxRuntime(hast, {
					jsx: jsx as any,
					jsxs: jsxs as any,
					Fragment,
					development: false,
					components: {
						pre: Base.Pre,
					},
				});

				setRenderedCode(rendered);
			} catch (error) {
				console.error('Error rendering code:', error);
				// Fallback to plain text
				setRenderedCode(
					<Base.Pre>
						<code>{code}</code>
					</Base.Pre>
				);
			} finally {
				setIsLoading(false);
			}
		}

		renderCode();
	}, [code, lang]);

	if (isLoading) {
		return (
			<Base.CodeBlock
				allowCopy={false}
				{...wrapper}
				className={cn('bg-muted/50 m-0 mt-2', wrapper?.className)}
			>
				<Base.Pre>
					<code className="animate-pulse">Loading...</code>
				</Base.Pre>
			</Base.CodeBlock>
		);
	}

	return (
		<Base.CodeBlock
			allowCopy={false}
			{...wrapper}
			className={cn('bg-muted/50 m-0 mt-2', wrapper?.className)}
		>
			{renderedCode}
		</Base.CodeBlock>
	);
}

interface PrettyCodeBlockOptions extends CodeBlockProps {
	background: React.ReactNode;
	container?: React.DetailedHTMLProps<
		React.HTMLAttributes<HTMLDivElement>,
		HTMLDivElement
	>;
}

export function PrettyCodeBlock({
	background,
	container,
	...props
}: PrettyCodeBlockOptions) {
	return (
		<div
			{...container}
			className={cn(
				'relative flex h-80 overflow-hidden rounded-lg sm:w-full xl:w-[593px] [&>div>canvas]:hidden [&>div>canvas]:sm:block',
				container?.className,
			)}
		>
			{background}
			<CodeBlock
				{...props}
				wrapper={{
					allowCopy: false,
					className:
						'bg-muted/50 dark:bg-muted/60 absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 m-auto w-11/12 backdrop-blur-xl border-none',
					...props.wrapper,
				}}
			/>
		</div>
	);
}