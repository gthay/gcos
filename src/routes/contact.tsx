import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHero } from "@/components/layout/PageHero";
import { ProtectedEmail } from "@/components/ui/ProtectedEmail";
import { ProtectedPhone } from "@/components/ui/ProtectedPhone";
import * as m from "@/paraglide/messages";

export const Route = createFileRoute("/contact")({
	component: ContactPage,
});

function ContactPage() {
	return (
		<div className="flex flex-col">
			{/* Hero Section */}
			<PageHero
				headline={m.contact_hero_headline()}
				subheadline={m.contact_hero_subheadline()}
			/>

			{/* Contact Information */}
			<section className="container pb-12">
				<div className="mx-auto max-w-2xl">
					<div className="flex flex-col gap-6 sm:flex-row sm:justify-center">
						<ProtectedEmail
							email="info@gcos.ai"
							className="flex items-center gap-3 text-lg font-medium text-primary hover:underline"
						>
							<Mail className="h-5 w-5" />
						</ProtectedEmail>
						<ProtectedPhone
							phone="+49 174 2634157"
							className="flex items-center gap-3 text-lg font-medium text-primary hover:underline"
						>
							<Phone className="h-5 w-5" />
						</ProtectedPhone>
					</div>
				</div>
			</section>

			{/* Contact Form */}
			<section className="container pb-16 md:pb-24">
				<div className="mx-auto max-w-2xl">
					<h2 className="mb-6 text-2xl font-semibold">
						{m.contact_form_title()}
					</h2>
					<form className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="name">
								{m.contact_form_name()}{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Input id="name" name="name" required />
						</div>

						<div className="space-y-2">
							<Label htmlFor="email">
								{m.contact_form_email()}{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Input id="email" name="email" type="email" required />
						</div>

						<div className="space-y-2">
							<Label htmlFor="organization">
								{m.contact_form_organization()}
							</Label>
							<Input id="organization" name="organization" />
						</div>

						<div className="space-y-2">
							<Label htmlFor="message">
								{m.contact_form_message()}{" "}
								<span className="text-destructive">*</span>
							</Label>
							<Textarea
								id="message"
								name="message"
								rows={6}
								required
								className="min-h-[150px]"
							/>
						</div>

						<div className="flex items-start gap-2">
							<Checkbox id="privacy" name="privacy" required />
							<Label
								htmlFor="privacy"
								className="text-sm font-normal leading-relaxed"
							>
								{m.contact_form_privacy_text()}{" "}
								<a href="#" className="text-primary hover:underline">
									{m.contact_form_privacy_link()}
								</a>
							</Label>
						</div>

						<Button type="submit" className="w-full">
							{m.contact_form_submit()}
						</Button>
					</form>
				</div>
			</section>

			{/* Location */}
			<section className="container pb-16 md:pb-24">
				<div className="mx-auto max-w-4xl">
					<div className="grid gap-8 lg:grid-cols-2">
						<div>
							<h2 className="mb-6 flex items-center gap-3 text-2xl font-semibold">
								<MapPin className="h-6 w-6 text-primary" />
								{m.contact_address_headline()}
							</h2>
							<div className="space-y-2">
								<p className="text-lg font-semibold">
									GC.OS German Center For Open Source AI Software Research
								</p>
								<p className="font-medium">Talstraße 14</p>
								<p className="font-medium">89584 Ehingen</p>
								<p className="font-medium">{m.contact_address_country()}</p>
								<p className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-medium text-foreground">
									{m.contact_address_note()}
								</p>
							</div>
						</div>
						<div className="relative aspect-video w-full overflow-hidden rounded-lg">
							<img
								src="/images/gcos_headquarter.webp"
								alt="GC.OS Headquarters"
								className="absolute inset-0 h-full w-full object-cover"
							/>
						</div>
					</div>
				</div>
			</section>

			{/* Join the Community */}
			<section className="container pb-16 md:pb-24">
				<div className="mx-auto max-w-2xl">
					<Card>
						<CardHeader>
							<div className="flex items-center gap-3">
								<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
									<Users className="h-6 w-6 text-primary" />
								</div>
								<div>
									<CardTitle>{m.contact_social_headline()}</CardTitle>
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-sm text-muted-foreground">
								{m.contact_social_description()}
							</p>
							<div className="flex flex-col gap-4">
								<a
									href="#"
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-3 text-sm font-medium text-primary hover:underline"
								>
									<svg
										className="h-5 w-5"
										fill="currentColor"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.007-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
									</svg>
									Discord
								</a>
								<a
									href="https://www.linkedin.com/company/german-center-for-open-source-ai"
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-3 text-sm font-medium text-primary hover:underline"
								>
									<svg
										className="h-5 w-5"
										fill="currentColor"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
									</svg>
									LinkedIn
								</a>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>
		</div>
	);
}
