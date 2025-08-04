'use client';

import {
	CheckIcon,
	CopyIcon,
	TerminalIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { cn } from '@/lib/cn';

const contents = ['npm install luats', 'bun add luats', 'yarn install luats'];

export function Install(
	props: React.DetailedHTMLProps<
		React.HTMLAttributes<HTMLButtonElement>,
		HTMLButtonElement
	>,
) {
	const [copied, setCopied] = useState(false);
	const [index, setIndex] = useState(0);

	const content = contents[index];

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(content);
			setCopied(true);
			setTimeout(() => setCopied(false), 3000);
		} catch (error) {
			setCopied(false);
			console.error(error);
		}
	};

	useEffect(() => {
		const interval = setInterval(() => {
			setIndex((prev) => (prev + 1) % contents.length);
		}, 2500);
		return () => clearInterval(interval);
	}, []);

	return (
		<div className="flex items-center gap-2">
			<button
				onClick={handleCopy}
				{...props}
				className={cn(
					'bg-secondary dark:bg-muted flex items-center gap-x-3 rounded-full border px-6 py-2 text-start outline-none transition-colors',
					props.className,
				)}
			>
				<TerminalIcon className="hidden size-4 sm:block md:size-5" />
				<AnimatePresence mode="wait">
					<motion.span
						key={content}
						initial={{ opacity: 0, filter: 'blur(4px)' }}
						animate={{ opacity: 1, filter: 'blur(0px)' }}
						exit={{ opacity: 0, filter: 'blur(4px)' }}
						transition={{ duration: 0.2 }}
						className="font-mono text-sm font-medium sm:text-base"
					>
						{content}
					</motion.span>
				</AnimatePresence>

				<div className="text-muted-foreground relative pl-1">
					<CopyIcon
						className={cn(
							'size-3 opacity-100 transition-opacity md:size-4',
							copied && 'opacity-0',
						)}
					/>
					<CheckIcon
						className={cn(
							'absolute inset-0 size-3 opacity-0 transition-opacity md:size-4',
							copied && 'opacity-100',
						)}
					/>
				</div>
			</button>
		</div>
	);
}
