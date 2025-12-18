import { createFileRoute } from "@tanstack/react-router";
import { Mail, Landmark, Building2, Receipt, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHero } from "@/components/layout/PageHero";
import { ProtectedEmail } from "@/components/ui/ProtectedEmail";
import * as m from "@/paraglide/messages";

export const Route = createFileRoute("/donate")({
	head: () => ({
		meta: [
			{
				title: m.donate_metadata_title(),
			},
			{
				name: "description",
				content: m.donate_metadata_description(),
			},
		],
	}),
	component: DonatePageContent,
});

export function DonatePageContent() {
	return (
		<div className="flex flex-col">
			{/* Hero Section */}
			<PageHero
				headline={m.donate_hero_headline()}
				subheadline={m.donate_hero_subheadline()}
			/>

			{/* Bank Details */}
			<section className="container pb-12">
				<div className="mx-auto max-w-2xl">
					<Card>
						<CardHeader>
							<div className="flex items-center gap-3">
								<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
									<Landmark className="h-6 w-6 text-primary" />
								</div>
								<CardTitle>{m.donate_bankDetails_title()}</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<p className="text-sm text-muted-foreground">
									{m.donate_bankDetails_recipient()}
								</p>
								<p className="font-semibold">
									GC.OS German Center for Open Source AI Software Research
								</p>
							</div>
							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<p className="text-sm text-muted-foreground">
										{m.donate_bankDetails_iban()}
									</p>
									<p className="font-mono font-semibold">
										DE08 6309 1010 0601 6740 06
									</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">
										{m.donate_bankDetails_bic()}
									</p>
									<p className="font-mono font-semibold">GENODES1EHI</p>
								</div>
							</div>
							<div className="grid gap-4 sm:grid-cols-2">
								<div>
									<p className="text-sm text-muted-foreground">
										{m.donate_taxInfo_taxNumber()}
									</p>
									<p className="font-semibold">58001/35083</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">
										{m.donate_taxInfo_vatNumber()}
									</p>
									<p className="font-semibold">DE 370 309 614</p>
								</div>
							</div>
							<div>
								<p className="text-sm text-muted-foreground">
									{m.donate_address_title()}
								</p>
								<p className="font-semibold">Talstraße 14</p>
								<p className="font-semibold">89584 Ehingen</p>
								<p className="font-semibold">{m.contact_address_country()}</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</section>

			{/* Info Cards */}
			<section className="container pb-16 md:pb-24">
				<div className="mx-auto max-w-2xl space-y-6">
					{/* Project Donations */}
					<Card>
						<CardHeader>
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
									<FileText className="h-5 w-5 text-primary" />
								</div>
								<CardTitle className="text-lg">
									{m.donate_projectDonation_title()}
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground">
								{m.donate_projectDonation_description()}
							</p>
						</CardContent>
					</Card>

					<div className="grid gap-6 md:grid-cols-2">
						{/* Tax Deductible */}
						<Card>
							<CardHeader>
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
										<Building2 className="h-5 w-5 text-primary" />
									</div>
									<CardTitle className="text-lg">
										{m.donate_taxDeductible_title()}
									</CardTitle>
								</div>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground">
									{m.donate_taxDeductible_description()}
								</p>
							</CardContent>
						</Card>

						{/* Donation Receipt */}
						<Card>
							<CardHeader>
								<div className="flex items-center gap-3">
									<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
										<Receipt className="h-5 w-5 text-primary" />
									</div>
									<CardTitle className="text-lg">
										{m.donate_receipt_title()}
									</CardTitle>
								</div>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground">
									{m.donate_receipt_description()}
								</p>
							</CardContent>
						</Card>
					</div>

					{/* Contact for specific purposes */}
					<Card>
						<CardHeader>
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
									<Mail className="h-5 w-5 text-primary" />
								</div>
								<CardTitle className="text-lg">
									{m.donate_contact_title()}
								</CardTitle>
							</div>
						</CardHeader>
						<CardContent className="space-y-3">
							<p className="text-muted-foreground">
								{m.donate_contact_description()}
							</p>
							<ProtectedEmail
								email="info@gcos.ai"
								className="inline-flex items-center gap-2 font-medium text-primary hover:underline"
							>
								<Mail className="h-4 w-4" />
							</ProtectedEmail>
						</CardContent>
					</Card>
				</div>
			</section>
		</div>
	);
}
