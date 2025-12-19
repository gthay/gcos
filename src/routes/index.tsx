import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
	Building2,
	Code,
	Download,
	GitBranch,
	Heart,
	Target,
	TrendingUp,
	Users,
	Users2,
} from "lucide-react";
import { motion } from "framer-motion";
import * as m from "@/paraglide/messages";
import { getProjects } from "@/lib/server/projects";
import { getMediaUrl } from "@/lib/media-utils";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
	const { data: projects = [] } = useQuery({
		queryKey: ["featured-projects"],
		queryFn: () => getProjects(),
	});

	// Split projects into featured and non-featured
	const featuredProjects = projects.filter((p) => p.featured);
	const otherProjects = projects.filter((p) => !p.featured);
	return (
		<div className="flex flex-col">
			{/* Hero Section */}
			<section className="relative container py-24 md:py-32 overflow-hidden">
				{/* Pattern Background */}
				<div className="absolute inset-0 -z-10 opacity-100">
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
					{/* Gradient fade on left and right */}
					<div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background pointer-events-none" />
				</div>

				<div className="relative mx-auto flex max-w-[64rem] flex-col items-center gap-6 text-center">
					{/* Brandmark */}
					<div className="mb-4">
						<img
							src="/icons/GCOS-Brandmark.svg"
							alt="GC.OS Brandmark"
							width={80}
							height={80}
							className="h-16 w-16 mx-auto"
						/>
					</div>

					{/* Organization Name Tag */}
					<div className="mb-2">
						<span className="inline-flex items-center rounded-full border border-border bg-card/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm sm:text-sm">
							{m.hero_organizationName()}
						</span>
					</div>

					<h1 className="text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
						{m.hero_headline_part1()}
						<br className="hidden md:block" />{" "}
						{m.hero_headline_part2()}
						<br className="hidden md:block" />{" "}
						{m.hero_headline_part3()}
					</h1>
					<p className="max-w-[42rem] text-lg text-muted-foreground sm:text-xl">
						{m.hero_subheadline()}
					</p>
					<div className="flex flex-col gap-4 sm:flex-row">
						<Button size="lg" asChild>
							<Link to="/projects">{m.hero_exploreProjects()}</Link>
						</Button>
						<Button size="lg" variant="outline" asChild>
							<Link to="/contact">{m.hero_getSupport()}</Link>
						</Button>
					</div>
				</div>
			</section>

			<Separator />

			{/* Target Audience Teasers */}
			<section className="container py-16 md:py-24">
				<div className="grid gap-8 md:grid-cols-3">
					<motion.div
						whileHover={{ scale: 1.02 }}
						transition={{ type: "spring", stiffness: 300 }}
					>
						<Card className="h-full">
							<CardHeader className="flex flex-row items-center gap-4">
								<Building2 className="h-12 w-12 text-primary shrink-0" />
								<CardTitle className="text-xl">
									{m.targetAudience_organizations_title()}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription className="text-base mb-4">
									{m.targetAudience_organizations_description()}
								</CardDescription>
								<ul className="text-sm text-muted-foreground space-y-2">
									<li className="flex items-start gap-2">
										<span className="text-primary">•</span>
										{m.services_consulting_title()}
									</li>
									<li className="flex items-start gap-2">
										<span className="text-primary">•</span>
										{m.services_consulting_description()}
									</li>
								</ul>
							</CardContent>
						</Card>
					</motion.div>

					<motion.div
						whileHover={{ scale: 1.02 }}
						transition={{ type: "spring", stiffness: 300 }}
					>
						<Card className="h-full">
							<CardHeader className="flex flex-row items-center gap-4">
								<Users className="h-12 w-12 text-primary shrink-0" />
								<CardTitle className="text-xl">
									{m.targetAudience_individuals_title()}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription className="text-base mb-4">
									{m.targetAudience_individuals_description()}
								</CardDescription>
								<ul className="text-sm text-muted-foreground space-y-2">
									<li className="flex items-start gap-2">
										<span className="text-primary">•</span>
										{m.services_mentoring_title()}
									</li>
									<li className="flex items-start gap-2">
										<span className="text-primary">•</span>
										{m.services_mentoring_description()}
									</li>
								</ul>
							</CardContent>
						</Card>
					</motion.div>

					<motion.div
						whileHover={{ scale: 1.02 }}
						transition={{ type: "spring", stiffness: 300 }}
					>
						<Card className="h-full">
							<CardHeader className="flex flex-row items-center gap-4">
								<Code className="h-12 w-12 text-primary shrink-0" />
								<CardTitle className="text-xl">
									{m.targetAudience_developers_title()}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription className="text-base mb-4">
									{m.targetAudience_developers_description()}
								</CardDescription>
								<ul className="text-sm text-muted-foreground space-y-2">
									<li className="flex items-start gap-2">
										<span className="text-primary">•</span>
										{m.services_projectSupport_title()}
									</li>
									<li className="flex items-start gap-2">
										<span className="text-primary">•</span>
										{m.services_projectSupport_description()}
									</li>
								</ul>
							</CardContent>
						</Card>
					</motion.div>
				</div>
			</section>

			<Separator />

			{/* Featured Projects */}
			<section className="container py-16 md:py-24">
				<div className="mx-auto max-w-[64rem]">
					<h2 className="mb-8 text-center text-3xl font-bold tracking-tight sm:text-4xl">
						{m.projects_title()}
					</h2>

					{/* Featured Projects - Large Cards (2 columns) */}
					{featuredProjects.length > 0 && (
						<div className="grid gap-6 md:grid-cols-2 mb-8">
							{featuredProjects.map((project) => (
								<motion.div
									key={project._id}
									whileHover={{ scale: 1.02 }}
									transition={{ type: "spring", stiffness: 300 }}
								>
									<Link to={`/projects/${project.slug}`} className="block">
										<Card className="h-full">
											<CardHeader>
												{project.logo ? (
													<div className="bg-white rounded-lg p-4 mb-4 flex items-center justify-center">
														<img
															src={getMediaUrl(project.logo)}
															alt={`${project.name} logo`}
															className="h-16 max-w-full object-contain"
														/>
													</div>
												) : (
													<CardTitle className="text-xl">
														{project.name}
													</CardTitle>
												)}
											</CardHeader>
											<CardContent>
												<CardDescription className="text-base">
													{project.shortDescription}
												</CardDescription>
											</CardContent>
										</Card>
									</Link>
								</motion.div>
							))}
						</div>
					)}

					{/* Other Projects - Small Cards (4 columns) */}
					{otherProjects.length > 0 && (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
							{otherProjects.map((project) => (
								<motion.div
									key={project._id}
									whileHover={{ scale: 1.02 }}
									transition={{ type: "spring", stiffness: 300 }}
								>
									<Link to={`/projects/${project.slug}`} className="block">
										<Card className="h-full">
											<CardHeader className="pb-2">
												{project.logo ? (
													<div className="bg-white rounded-md p-2 mb-2 flex items-center justify-center">
														<img
															src={getMediaUrl(project.logo)}
															alt={`${project.name} logo`}
															className="h-10 max-w-full object-contain"
														/>
													</div>
												) : (
													<CardTitle className="text-base">
														{project.name}
													</CardTitle>
												)}
											</CardHeader>
											<CardContent className="pt-0">
												<CardDescription className="text-sm line-clamp-2">
													{project.shortDescription}
												</CardDescription>
											</CardContent>
										</Card>
									</Link>
								</motion.div>
							))}
						</div>
					)}

					{/* Loading skeleton when no projects */}
					{projects.length === 0 && (
						<div className="grid gap-6 md:grid-cols-3">
							{[1, 2, 3].map((i) => (
								<Card key={i} className="animate-pulse">
									<CardHeader>
										<div className="h-6 w-32 bg-muted rounded" />
									</CardHeader>
									<CardContent>
										<div className="h-4 w-full bg-muted rounded" />
										<div className="h-4 w-3/4 bg-muted rounded mt-2" />
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</div>
			</section>

			<Separator />

			{/* How We Work */}
			<section className="container py-16 md:py-24">
				<div className="mx-auto max-w-[64rem]">
					<h2 className="mb-8 text-center text-3xl font-bold tracking-tight sm:text-4xl">
						{m.howWeWork_title()}
					</h2>
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardHeader>
								<Users2 className="mb-4 h-10 w-10 text-primary" />
								<CardTitle>
									{m.howWeWork_principles_democratic_title()}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription>
									{m.howWeWork_principles_democratic_description()}
								</CardDescription>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<GitBranch className="mb-4 h-10 w-10 text-primary" />
								<CardTitle>
									{m.howWeWork_principles_openSource_title()}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription>
									{m.howWeWork_principles_openSource_description()}
								</CardDescription>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<Heart className="mb-4 h-10 w-10 text-primary" />
								<CardTitle>
									{m.howWeWork_principles_community_title()}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription>
									{m.howWeWork_principles_community_description()}
								</CardDescription>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<Target className="mb-4 h-10 w-10 text-primary" />
								<CardTitle>{m.howWeWork_principles_impact_title()}</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription>
									{m.howWeWork_principles_impact_description()}
								</CardDescription>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			<Separator />

			{/* Impact / Numbers */}
			<section className="container py-12 md:py-16">
				<div className="mx-auto max-w-[64rem]">
					<h2 className="mb-6 text-center text-3xl font-bold tracking-tight sm:text-4xl">
						{m.impact_title()}
					</h2>
					<div className="grid gap-6 md:grid-cols-3">
						<Card className="text-center">
							<CardHeader>
								<Download className="mx-auto mb-4 h-12 w-12 text-primary" />
								<CardTitle className="text-4xl font-bold">150K+</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription className="text-lg">
									{m.impact_monthlyDownloads()}
								</CardDescription>
							</CardContent>
						</Card>

						<Card className="text-center">
							<CardHeader>
								<TrendingUp className="mx-auto mb-4 h-12 w-12 text-primary" />
								<CardTitle className="text-4xl font-bold">2.5M+</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription className="text-lg">
									{m.impact_totalDownloads()}
								</CardDescription>
							</CardContent>
						</Card>

						<Card className="text-center">
							<CardHeader>
								<Users className="mx-auto mb-4 h-12 w-12 text-primary" />
								<CardTitle className="text-4xl font-bold">85+</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription className="text-lg">
									{m.impact_contributors()}
								</CardDescription>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			<Separator />

			{/* Used By / Testimonials */}
			<section className="container py-12 md:py-16">
				<div className="mx-auto max-w-[64rem]">
					<h2 className="mb-8 text-center text-3xl font-bold tracking-tight sm:text-4xl">
						{m.usedBy_title()}
					</h2>
					<div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
						{/* Platzhalter für Firmenlogos - später durch echte Logos ersetzen */}
						<div className="bg-white rounded-lg p-4 h-16 w-32 flex items-center justify-center">
							<span className="text-muted-foreground text-sm">Logo 1</span>
						</div>
						<div className="bg-white rounded-lg p-4 h-16 w-32 flex items-center justify-center">
							<span className="text-muted-foreground text-sm">Logo 2</span>
						</div>
						<div className="bg-white rounded-lg p-4 h-16 w-32 flex items-center justify-center">
							<span className="text-muted-foreground text-sm">Logo 3</span>
						</div>
						<div className="bg-white rounded-lg p-4 h-16 w-32 flex items-center justify-center">
							<span className="text-muted-foreground text-sm">Logo 4</span>
						</div>
					</div>
				</div>
			</section>

			<Separator />

			{/* FAQ Section */}
			<section className="container py-16 md:py-24">
				<div className="mx-auto max-w-[64rem]">
					<h2 className="mb-8 text-center text-3xl font-bold tracking-tight sm:text-4xl">
						{m.faq_title()}
					</h2>
					<Accordion type="multiple" className="w-full">
						<AccordionItem value="q1">
							<AccordionTrigger className="text-left">
								{m.faq_q1_question()}
							</AccordionTrigger>
							<AccordionContent className="text-muted-foreground">
								{m.faq_q1_answer()}
							</AccordionContent>
						</AccordionItem>

						<AccordionItem value="q2">
							<AccordionTrigger className="text-left">
								{m.faq_q2_question()}
							</AccordionTrigger>
							<AccordionContent className="text-muted-foreground">
								{m.faq_q2_answer()}
							</AccordionContent>
						</AccordionItem>

						<AccordionItem value="q3">
							<AccordionTrigger className="text-left">
								{m.faq_q3_question()}
							</AccordionTrigger>
							<AccordionContent className="text-muted-foreground">
								{m.faq_q3_answer()}
							</AccordionContent>
						</AccordionItem>

						<AccordionItem value="q4">
							<AccordionTrigger className="text-left">
								{m.faq_q4_question()}
							</AccordionTrigger>
							<AccordionContent className="text-muted-foreground">
								{m.faq_q4_answer()}
							</AccordionContent>
						</AccordionItem>

						<AccordionItem value="q5">
							<AccordionTrigger className="text-left">
								{m.faq_q5_question()}
							</AccordionTrigger>
							<AccordionContent className="text-muted-foreground">
								{m.faq_q5_answer()}
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				</div>
			</section>

			<Separator />

			{/* Call-to-Action Section */}
			<section className="container py-16 md:py-24">
				<div className="mx-auto flex max-w-[64rem] flex-col items-center gap-6 text-center">
					<h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
						{m.cta_title()}
					</h2>
					<div className="flex flex-col gap-4 sm:flex-row">
						<Button size="lg" asChild>
							<Link to="/contact">{m.cta_becomeMember()}</Link>
						</Button>
						<Button size="lg" variant="outline" asChild>
							<Link to="/contact">{m.cta_startProject()}</Link>
						</Button>
						<Button size="lg" variant="outline" asChild>
							<Link to="/contact">{m.cta_bookConsultation()}</Link>
						</Button>
						<Button size="lg" variant="outline" asChild>
							<Link to="/donate">{m.cta_donate()}</Link>
						</Button>
					</div>
				</div>
			</section>
		</div>
	);
}
