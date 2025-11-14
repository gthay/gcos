import { createFileRoute } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { PageHero } from "@/components/layout/PageHero";
import {
	Code,
	Users,
	Building2,
	Target,
	Heart,
	GitBranch,
	Shield,
	FileText,
} from "lucide-react";
import * as m from "@/paraglide/messages";

export const Route = createFileRoute("/about")({
	head: () => ({
		meta: [
			{
				title: m.about_metadata_title(),
			},
			{
				name: "description",
				content: m.about_metadata_description(),
			},
		],
	}),
	component: AboutPage,
});

function AboutPage() {
	return (
		<div className="flex flex-col">
			{/* 1. Hero Section */}
			<PageHero
				headline={m.about_hero_headline()}
				subheadline={m.about_hero_subheadline()}
			/>

			<Separator />

			{/* 2. Our Story */}
			<section className="container py-16 md:py-24">
				<div className="mx-auto max-w-3xl">
					<h2 className="mb-8 text-center text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
						{m.about_story_headline()}
					</h2>
					<div className="space-y-6 text-lg text-muted-foreground">
						<p>{m.about_story_problem()}</p>
						<p>{m.about_story_vision()}</p>
						<p>{m.about_story_solution()}</p>
					</div>
				</div>
			</section>

			<Separator />

			{/* 3. Mission & Vision */}
			<section className="container py-16 md:py-24">
				<div className="mx-auto max-w-4xl">
					<h2 className="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
						{m.about_mission_headline()}
					</h2>

					<div className="grid gap-8 md:grid-cols-2">
						{/* Mission */}
						<Card>
							<CardHeader>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
									<Target className="h-6 w-6 text-primary" />
								</div>
								<CardTitle className="text-2xl">
									{m.about_mission_missionTitle()}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground">
									{m.about_mission_missionDescription()}
								</p>
							</CardContent>
						</Card>

						{/* Vision */}
						<Card>
							<CardHeader>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
									<Heart className="h-6 w-6 text-primary" />
								</div>
								<CardTitle className="text-2xl">
									{m.about_mission_visionTitle()}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground">
									{m.about_mission_visionDescription()}
								</p>
							</CardContent>
						</Card>
					</div>

					{/* Values */}
					<div className="mt-12">
						<h3 className="mb-8 text-center text-2xl font-semibold">
							{m.about_mission_valuesTitle()}
						</h3>
						<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
							<Card>
								<CardHeader>
									<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
										<Shield className="h-5 w-5 text-primary" />
									</div>
									<CardTitle className="text-lg">
										{m.about_mission_values_transparency_title()}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground">
										{m.about_mission_values_transparency_description()}
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
										<Users className="h-5 w-5 text-primary" />
									</div>
									<CardTitle className="text-lg">
										{m.about_mission_values_democracy_title()}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground">
										{m.about_mission_values_democracy_description()}
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
										<Heart className="h-5 w-5 text-primary" />
									</div>
									<CardTitle className="text-lg">
										{m.about_mission_values_commonGood_title()}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground">
										{m.about_mission_values_commonGood_description()}
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
										<GitBranch className="h-5 w-5 text-primary" />
									</div>
									<CardTitle className="text-lg">
										{m.about_mission_values_openSource_title()}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground">
										{m.about_mission_values_openSource_description()}
									</p>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</section>

			<Separator />

			{/* 4. What We Do */}
			<section className="container py-16 md:py-24">
				<div className="mx-auto max-w-4xl">
					<h2 className="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
						{m.about_whatWeDo_headline()}
					</h2>
					<div className="grid gap-8 md:grid-cols-3">
						<Card>
							<CardHeader>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
									<Code className="h-6 w-6 text-primary" />
								</div>
								<CardTitle className="text-xl">
									{m.about_whatWeDo_projectSupport_title()}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground">
									{m.about_whatWeDo_projectSupport_description()}
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
									<Users className="h-6 w-6 text-primary" />
								</div>
								<CardTitle className="text-xl">
									{m.about_whatWeDo_education_title()}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground">
									{m.about_whatWeDo_education_description()}
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
									<Building2 className="h-6 w-6 text-primary" />
								</div>
								<CardTitle className="text-xl">
									{m.about_whatWeDo_consulting_title()}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground">
									{m.about_whatWeDo_consulting_description()}
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			<Separator />

			{/* 5. Team */}
			<section className="container py-16 md:py-24">
				<div className="mx-auto max-w-5xl">
					<h2 className="mb-4 text-center text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
						{m.about_team_headline()}
					</h2>
					<p className="mb-12 text-center text-lg text-muted-foreground">
						{m.about_team_description()}
					</p>
					<div className="text-center text-muted-foreground">
						<p>No team members found.</p>
					</div>
				</div>
			</section>

			<Separator />

			{/* 9. Legal Structure */}
			<section className="container py-16 md:py-24">
				<div className="mx-auto max-w-3xl">
					<h2 className="mb-8 text-center text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
						{m.about_legal_headline()}
					</h2>
					<Card>
						<CardHeader>
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
								<FileText className="h-6 w-6 text-primary" />
							</div>
							<CardTitle className="text-2xl">
								{m.about_legal_status()}
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-muted-foreground">{m.about_legal_meaning()}</p>
							<p className="text-muted-foreground">
								{m.about_legal_governance()}
							</p>
							<div className="pt-4">
								<a
									href="#"
									className="text-sm font-medium text-primary hover:underline"
								>
									{m.about_legal_documents()} →
								</a>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>
		</div>
	);
}
