import { createFileRoute, Link } from "@tanstack/react-router";
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
	GitBranch,
	Heart,
	Target,
	TrendingUp,
	Users,
	Users2,
} from "lucide-react";
import * as m from "@/paraglide/messages";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
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
						{m.hero_headline()}
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
					<Card>
						<CardHeader>
							<Building2 className="mb-4 h-10 w-10 text-primary" />
							<CardTitle>{m.targetAudience_organizations_title()}</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription className="text-base">
								{m.targetAudience_organizations_description()}
							</CardDescription>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<Users className="mb-4 h-10 w-10 text-primary" />
							<CardTitle>{m.targetAudience_individuals_title()}</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription className="text-base">
								{m.targetAudience_individuals_description()}
							</CardDescription>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<Code className="mb-4 h-10 w-10 text-primary" />
							<CardTitle>{m.targetAudience_developers_title()}</CardTitle>
						</CardHeader>
						<CardContent>
							<CardDescription className="text-base">
								{m.targetAudience_developers_description()}
							</CardDescription>
						</CardContent>
					</Card>
				</div>
			</section>

			<Separator />

			{/* Featured Projects */}
			<section className="container py-16 md:py-24">
				<div className="mx-auto max-w-[64rem]">
					<h2 className="mb-8 text-center text-3xl font-bold tracking-tight sm:text-4xl">
						{m.projects_title()}
					</h2>
					<div className="grid gap-6 md:grid-cols-3">
						<Card>
							<CardHeader>
								<CardTitle>{m.projects_sktime_name()}</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription>
									{m.projects_sktime_description()}
								</CardDescription>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>{m.projects_featureEngine_name()}</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription>
									{m.projects_featureEngine_description()}
								</CardDescription>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>{m.projects_pytorchForecasting_name()}</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription>
									{m.projects_pytorchForecasting_description()}
								</CardDescription>
							</CardContent>
						</Card>
					</div>
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
			<section className="container py-16 md:py-24">
				<div className="mx-auto max-w-[64rem]">
					<h2 className="mb-8 text-center text-3xl font-bold tracking-tight sm:text-4xl">
						{m.impact_title()}
					</h2>
					<div className="grid gap-6 md:grid-cols-3">
						<Card className="text-center">
							<CardHeader>
								<TrendingUp className="mx-auto mb-4 h-12 w-12 text-primary" />
								<CardTitle className="text-4xl font-bold">50+</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription className="text-lg">
									{m.impact_projectsSupported()}
								</CardDescription>
							</CardContent>
						</Card>

						<Card className="text-center">
							<CardHeader>
								<Users className="mx-auto mb-4 h-12 w-12 text-primary" />
								<CardTitle className="text-4xl font-bold">200+</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription className="text-lg">
									{m.impact_mentees()}
								</CardDescription>
							</CardContent>
						</Card>

						<Card className="text-center">
							<CardHeader>
								<Building2 className="mx-auto mb-4 h-12 w-12 text-primary" />
								<CardTitle className="text-4xl font-bold">30+</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription className="text-lg">
									{m.impact_organizations()}
								</CardDescription>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			<Separator />

			{/* Services Overview */}
			<section className="container py-16 md:py-24">
				<div className="mx-auto max-w-[64rem]">
					<h2 className="mb-8 text-center text-3xl font-bold tracking-tight sm:text-4xl">
						{m.services_title()}
					</h2>
					<div className="grid gap-6 md:grid-cols-3">
						<Card>
							<CardHeader>
								<CardTitle>{m.services_mentoring_title()}</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription>
									{m.services_mentoring_description()}
								</CardDescription>
								<Button className="mt-4" variant="outline" asChild>
									<a href="#">Learn More</a>
								</Button>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>{m.services_consulting_title()}</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription>
									{m.services_consulting_description()}
								</CardDescription>
								<Button className="mt-4" variant="outline" asChild>
									<a href="#">Learn More</a>
								</Button>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>{m.services_projectSupport_title()}</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription>
									{m.services_projectSupport_description()}
								</CardDescription>
								<Button className="mt-4" variant="outline" asChild>
									<a href="#">Learn More</a>
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			<Separator />

			{/* Testimonials */}
			<section className="container py-16 md:py-24">
				<div className="mx-auto max-w-[64rem]">
					<h2 className="mb-8 text-center text-3xl font-bold tracking-tight sm:text-4xl">
						{m.testimonials_title()}
					</h2>
					<div className="grid gap-6 md:grid-cols-3">
						<Card>
							<CardContent className="pt-6">
								<p className="mb-4 italic text-muted-foreground">
									"GC.OS helped us transform our AI strategy with open source
									solutions. The consulting was invaluable."
								</p>
								<p className="font-semibold">— Organization Leader</p>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="pt-6">
								<p className="mb-4 italic text-muted-foreground">
									"The mentoring program accelerated my career in AI. I'm now
									working on cutting-edge open source projects."
								</p>
								<p className="font-semibold">— AI Professional</p>
							</CardContent>
						</Card>

						<Card>
							<CardContent className="pt-6">
								<p className="mb-4 italic text-muted-foreground">
									"The fellowship support enabled us to build and scale our open
									source AI project. Thank you GC.OS!"
								</p>
								<p className="font-semibold">— Open Source Developer</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			<Separator />

			{/* Latest News / Blog Preview */}
			<section className="container py-16 md:py-24">
				<div className="mx-auto max-w-[64rem]">
					<h2 className="mb-8 text-center text-3xl font-bold tracking-tight sm:text-4xl">
						{m.news_title()}
					</h2>
					<div className="grid gap-6 md:grid-cols-3">
						<Card>
							<CardHeader>
								<CardTitle>Latest AI Developments</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription>
									Exploring the latest trends in open source AI and their impact
									on society.
								</CardDescription>
								<Button className="mt-4" variant="link" asChild>
									<a href="#">{m.news_readMore()} →</a>
								</Button>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Community Spotlight</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription>
									Highlighting the amazing work of our community members and
									their contributions.
								</CardDescription>
								<Button className="mt-4" variant="link" asChild>
									<a href="#">{m.news_readMore()} →</a>
								</Button>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Upcoming Events</CardTitle>
							</CardHeader>
							<CardContent>
								<CardDescription>
									Join us for workshops, conferences, and community meetups.
								</CardDescription>
								<Button className="mt-4" variant="link" asChild>
									<a href="#">{m.news_readMore()} →</a>
								</Button>
							</CardContent>
						</Card>
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
