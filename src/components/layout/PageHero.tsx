import { cn } from "@/lib/utils";

interface PageHeroProps {
	headline: string;
	subheadline?: string;
	className?: string;
}

export function PageHero({ headline, subheadline, className }: PageHeroProps) {
	return (
		<section
			className={cn(
				"relative container py-16 md:py-24 overflow-hidden",
				className,
			)}
		>
			{/* Subtle Pattern Background */}
			<div className="absolute inset-0 -z-10 opacity-30">
				<img
					src="/images/GCOS-Pattern-Light.svg"
					alt=""
					className="absolute inset-0 w-full h-full object-cover dark:hidden"
				/>
				<img
					src="/images/GCOS-Pattern-Slate.svg"
					alt=""
					className="absolute inset-0 w-full h-full object-cover hidden dark:block"
				/>
				{/* Gradient fade */}
				<div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background pointer-events-none" />
			</div>

			<div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
				{/* Brandmark with Decorative Underline */}
				<div className="mb-2 flex flex-col items-center">
					<div className="mb-3">
						<img
							src="/icons/GCOS-Brandmark.svg"
							alt="GC.OS Brandmark"
							width={56}
							height={56}
							className="h-12 w-12 md:h-14 md:w-14 mx-auto"
						/>
					</div>
					{/* Decorative Underline */}
					<div className="relative w-16 h-0.5">
						<div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent opacity-60" />
						<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-primary" />
					</div>
				</div>

				<h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
					{headline}
				</h1>
				{subheadline && (
					<p className="mt-2 max-w-2xl text-lg text-muted-foreground md:text-xl">
						{subheadline}
					</p>
				)}
			</div>
		</section>
	);
}
