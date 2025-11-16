import { useEffect, useRef } from "react";

interface ProtectedPhoneProps {
	phone: string;
	className?: string;
	children?: React.ReactNode;
}

/**
 * Displays a phone number with [tel] replacement to protect against scrapers.
 * The phone number is readable without JavaScript, but JavaScript will automatically fix both
 * the visible text and the tel: link.
 */
export function ProtectedPhone({
	phone,
	className,
	children,
}: ProtectedPhoneProps) {
	const linkRef = useRef<HTMLAnchorElement>(null);
	const textRef = useRef<HTMLSpanElement>(null);

	// Remove all non-digit characters except + for the actual phone number
	const cleanPhone = phone.replace(/\D/g, "");
	// For display, insert [tel] after country code: +49 [tel] 174 2634157
	// This keeps the format readable while obfuscating the full number
	const displayPhone = phone.replace(/\s+/g, " ").replace(/(\+?\d{1,3})\s+/, "$1 [tel] ");

	useEffect(() => {
		// Fix both the href attribute and the visible text after component mounts
		if (linkRef.current) {
			linkRef.current.href = `tel:+${cleanPhone}`;
		}
		if (textRef.current) {
			textRef.current.textContent = phone;
		}
	}, [phone, cleanPhone]);

	return (
		<a
			ref={linkRef}
			href={`tel:${displayPhone}`}
			className={className}
			onClick={(e) => {
				// Ensure the correct phone is used even if href wasn't fixed yet
				e.currentTarget.href = `tel:+${cleanPhone}`;
			}}
		>
			{children}
			<span ref={textRef}>{displayPhone}</span>
		</a>
	);
}

