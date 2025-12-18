import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/layout/PageHero";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as m from "@/paraglide/messages";

type CourseCardData = {
	id: string;
	title: string;
	instructor: string;
	summary: string;
	schedule: string;
	mode: string;
	image: string;
	imageAlt: string;
	cta?: string;
};

const getFeaturedCourse = (): CourseCardData => ({
	id: "n8n-intro",
	title: m.courses_featured_card_title(),
	instructor: m.courses_featured_card_instructor(),
	summary: m.courses_featured_card_summary(),
	schedule: m.courses_featured_card_schedule(),
	mode: m.courses_featured_card_mode(),
	image: "/images/gcos_headquarter.webp",
	imageAlt: m.courses_featured_card_imageAlt(),
	cta: m.courses_featured_card_cta(),
});

const getCatalogCourses = (): CourseCardData[] => [
	{
		...getFeaturedCourse(),
		id: "n8n-intro-list",
	},
	{
		id: "pgmpy-causal",
		title: m.courses_catalog_card_pgmpy_title(),
		instructor: m.courses_catalog_card_pgmpy_instructor(),
		summary: m.courses_catalog_card_pgmpy_summary(),
		schedule: m.courses_catalog_card_pgmpy_schedule(),
		mode: m.courses_catalog_card_pgmpy_mode(),
		image: "/images/GCOS-Pattern-Light.svg",
		imageAlt: m.courses_catalog_card_pgmpy_imageAlt(),
	},
];

export const Route = createFileRoute("/courses")({
	head: () => ({
		meta: [
			{
				title: m.courses_metadata_title(),
			},
			{
				name: "description",
				content: m.courses_metadata_description(),
			},
		],
	}),
	component: CoursesPageContent,
});

export function CoursesPageContent() {
	const featuredCourse = getFeaturedCourse();
	const catalogCourses = getCatalogCourses();

	return (
		<div className="flex flex-col">
			<PageHero
				headline={m.courses_hero_headline()}
				subheadline={m.courses_hero_subheadline()}
			/>

			<section className="container pb-16 md:pb-24">
				<div className="flex flex-col gap-3">
					<span className="inline-flex w-fit rounded-full border border-primary/40 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
						{m.courses_featured_section_badge()}
					</span>
					<h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
						{m.courses_featured_section_title()}
					</h2>
				</div>

				<Card className="mt-8 overflow-hidden border-primary/30 shadow-lg">
					<div className="grid gap-0 lg:grid-cols-2">
						<div className="relative h-64 w-full overflow-hidden lg:h-full">
							<img
								src={featuredCourse.image}
								alt={featuredCourse.imageAlt}
								className="h-full w-full object-cover"
								loading="lazy"
							/>
							<div className="absolute inset-0 bg-gradient-to-tr from-background/50 via-transparent to-transparent" />
						</div>
						<div className="flex flex-col justify-between p-8 sm:p-10">
							<div className="space-y-3">
								<p className="text-sm font-medium text-muted-foreground">
									{featuredCourse.instructor}
								</p>
								<h3 className="text-2xl font-semibold tracking-tight">
									{featuredCourse.title}
								</h3>
								<p className="text-base text-muted-foreground">
									{featuredCourse.summary}
								</p>
							</div>
							<div className="mt-8 space-y-3 text-sm">
								<p className="font-semibold text-foreground">
									{featuredCourse.schedule}
								</p>
								<p className="text-muted-foreground">{featuredCourse.mode}</p>
							</div>
							<div className="mt-8 flex flex-wrap items-center gap-4">
								<span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
									{featuredCourse.mode}
								</span>
								<Button size="lg" asChild>
									<a href="#">{featuredCourse.cta}</a>
								</Button>
							</div>
						</div>
					</div>
				</Card>
			</section>

			<section className="container pb-20 md:pb-28">
				<div className="flex flex-col gap-4 text-center">
					<h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
						{m.courses_catalog_section_title()}
					</h2>
					<p className="mx-auto max-w-3xl text-lg text-muted-foreground">
						{m.courses_catalog_section_description()}
					</p>
				</div>

				<div className="mt-12 grid gap-8 md:grid-cols-2">
					{catalogCourses.map((course) => (
						<Card key={course.id} className="flex h-full flex-col overflow-hidden">
							<div className="aspect-video w-full overflow-hidden bg-muted">
								<img
									src={course.image}
									alt={course.imageAlt}
									className="h-full w-full object-cover"
									loading="lazy"
								/>
							</div>
							<CardHeader>
								<CardTitle className="text-xl">{course.title}</CardTitle>
								<CardDescription>{course.instructor}</CardDescription>
							</CardHeader>
							<CardContent className="flex flex-1 flex-col">
								<p className="text-sm text-muted-foreground">{course.summary}</p>
								<div className="mt-6 space-y-3 text-sm font-medium">
									<p>{course.schedule}</p>
									<p className="text-muted-foreground">{course.mode}</p>
								</div>
								<Button variant="outline" className="mt-8">
									{m.courses_catalog_waitlist()}
								</Button>
							</CardContent>
						</Card>
					))}
				</div>
			</section>
		</div>
	);
}








