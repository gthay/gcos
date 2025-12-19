import { cn } from "@/lib/utils";

interface CharCountIndicatorProps {
	value: string;
	minOptimal: number;
	maxOptimal: number;
	minAcceptable?: number;
	maxAcceptable?: number;
	label?: string;
}

type Status = "too-short" | "short" | "optimal" | "long" | "too-long";

function getStatus(
	length: number,
	minOptimal: number,
	maxOptimal: number,
	minAcceptable?: number,
	maxAcceptable?: number
): Status {
	const minAccept = minAcceptable ?? minOptimal * 0.6;
	const maxAccept = maxAcceptable ?? maxOptimal * 1.2;

	if (length === 0) return "too-short";
	if (length < minAccept) return "too-short";
	if (length < minOptimal) return "short";
	if (length <= maxOptimal) return "optimal";
	if (length <= maxAccept) return "long";
	return "too-long";
}

function getStatusColor(status: Status): string {
	switch (status) {
		case "too-short":
			return "bg-red-500";
		case "short":
			return "bg-yellow-500";
		case "optimal":
			return "bg-green-500";
		case "long":
			return "bg-yellow-500";
		case "too-long":
			return "bg-red-500";
	}
}

function getStatusText(status: Status): string {
	switch (status) {
		case "too-short":
			return "Too short";
		case "short":
			return "A bit short";
		case "optimal":
			return "Good length";
		case "long":
			return "A bit long";
		case "too-long":
			return "Too long";
	}
}

export function CharCountIndicator({
	value,
	minOptimal,
	maxOptimal,
	minAcceptable,
	maxAcceptable,
	label,
}: CharCountIndicatorProps) {
	const length = value.length;
	const status = getStatus(length, minOptimal, maxOptimal, minAcceptable, maxAcceptable);
	const statusColor = getStatusColor(status);
	const statusText = getStatusText(status);

	return (
		<div className="flex items-center gap-2 text-xs text-muted-foreground">
			<div
				className={cn(
					"h-2 w-2 rounded-full transition-colors",
					statusColor
				)}
				title={statusText}
			/>
			<span>
				{length} / {minOptimal}-{maxOptimal} {label || "characters"}
			</span>
			<span
				className={cn(
					"ml-auto",
					status === "optimal" && "text-green-600 dark:text-green-400",
					(status === "short" || status === "long") && "text-yellow-600 dark:text-yellow-400",
					(status === "too-short" || status === "too-long") && "text-red-600 dark:text-red-400"
				)}
			>
				{statusText}
			</span>
		</div>
	);
}

// Preset configurations for common SEO fields
export function MetaTitleIndicator({ value }: { value: string }) {
	return (
		<CharCountIndicator
			value={value}
			minOptimal={50}
			maxOptimal={60}
			minAcceptable={30}
			maxAcceptable={70}
		/>
	);
}

export function MetaDescriptionIndicator({ value }: { value: string }) {
	return (
		<CharCountIndicator
			value={value}
			minOptimal={150}
			maxOptimal={160}
			minAcceptable={120}
			maxAcceptable={170}
		/>
	);
}








