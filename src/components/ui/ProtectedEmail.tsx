import { useEffect, useRef } from "react";

interface ProtectedEmailProps {
	email: string;
	className?: string;
	children?: React.ReactNode;
}

/**
 * Displays an email address with [at] and [dot] replacements to protect against scrapers.
 * The email is readable without JavaScript, but JavaScript will automatically fix both
 * the visible text and the mailto: link.
 */
export function ProtectedEmail({
	email,
	className,
	children,
}: ProtectedEmailProps) {
	const linkRef = useRef<HTMLAnchorElement>(null);
	const textRef = useRef<HTMLSpanElement>(null);

	// Replace @ with [at] and . with [dot] for display
	const obfuscatedEmail = email.replace(/@/g, "[at]").replace(/\./g, "[dot]");

	useEffect(() => {
		// Fix both the href attribute and the visible text after component mounts
		if (linkRef.current) {
			linkRef.current.href = `mailto:${email}`;
		}
		if (textRef.current) {
			textRef.current.textContent = email;
		}
	}, [email]);

	return (
		<a
			ref={linkRef}
			href={`mailto:${obfuscatedEmail}`}
			className={className}
			onClick={(e) => {
				// Ensure the correct email is used even if href wasn't fixed yet
				e.currentTarget.href = `mailto:${email}`;
			}}
		>
			{children}
			<span ref={textRef}>{obfuscatedEmail}</span>
		</a>
	);
}

