import { createFileRoute } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";
import { PageHero } from "@/components/layout/PageHero";
import { ProtectedEmail } from "@/components/ui/ProtectedEmail";
import { ProtectedPhone } from "@/components/ui/ProtectedPhone";
import { getLocale } from "@/paraglide/runtime.js";

export const Route = createFileRoute("/imprint")({
	component: ImprintPage,
});

export function ImprintPage() {
	const locale = getLocale();
	const isGerman = locale === "de";

	return (
		<div className="flex flex-col">
			<PageHero
				headline={isGerman ? "Impressum" : "Legal Notice"}
				subheadline={isGerman ? "Rechtliche Angaben" : "Impressum"}
			/>

			<Separator />

			<section className="container py-16 md:py-24">
				<div className="mx-auto max-w-3xl space-y-8">
					<div>
						<p className="mb-4 text-lg">
							GC.OS German Centre For Open Source AI Software Research gGmbH
							<br />
							Talstraße 14
							<br />
							89584 Ehingen (Donau)
							<br />
							{isGerman ? "Deutschland" : "Germany"}
						</p>
					</div>

					<div>
						<p className="mb-4 text-lg">
							{isGerman ? (
								<>
									Handelsregister: HRB 748750
									<br />
									Registergericht: Amtsgericht Ehingen (Donau)
								</>
							) : (
								<>
									Commercial Register: HRB 748750
									<br />
									Register Court: Local Court of Ehingen (Donau)
								</>
							)}
						</p>
					</div>

					<div>
						<p className="mb-2 text-lg font-semibold">
							{isGerman ? "Vertreten durch:" : "Represented by:"}
						</p>
						<p className="text-lg">Franz Király</p>
					</div>

					<Separator />

					<div>
						<h2 className="mb-4 text-2xl font-semibold">
							{isGerman ? "Kontakt" : "Contact"}
						</h2>
						<p className="mb-2 text-lg">
							{isGerman ? "Telefon:" : "Phone:"}{" "}
							<ProtectedPhone
								phone="+49 174 2634157"
								className="text-primary hover:underline"
							/>
						</p>
						<p className="text-lg">
							{isGerman ? "E-Mail:" : "Email:"}{" "}
							<ProtectedEmail
								email="info@gcos.ai"
								className="text-primary hover:underline"
							/>
						</p>
					</div>

					<Separator />

					<div>
						<h2 className="mb-4 text-2xl font-semibold">
							{isGerman ? "Umsatzsteuer-ID" : "VAT Identification Number"}
						</h2>
						<p className="text-lg">
							{isGerman ? (
								<>
									Umsatzsteuer-Identifikationsnummer gemäß § 27 a
									Umsatzsteuergesetz:
									<br />
									DE 370 309 614
								</>
							) : (
								<>
									VAT Identification Number in accordance with § 27a German Value
									Added Tax Act (UStG):
									<br />
									DE 370 309 614
								</>
							)}
						</p>
					</div>

					<Separator />

					<div>
						<h2 className="mb-4 text-2xl font-semibold">
							{isGerman
								? "Redaktionell verantwortlich"
								: "Person Responsible for Editorial Content"}
						</h2>
						<p className="text-lg">Franz Király</p>
					</div>

					<Separator />

					<div>
						<h2 className="mb-4 text-2xl font-semibold">
							{isGerman
								? "Verbraucherstreitbeilegung/Universalschlichtungsstelle"
								: "Consumer Dispute Resolution / Universal Arbitration Board"}
						</h2>
						<p className="text-lg">
							{isGerman
								? "Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen."
								: "We are neither willing nor obliged to participate in dispute resolution proceedings before a consumer arbitration board."}
						</p>
					</div>

					<Separator />

					<div>
						<h2 className="mb-4 text-2xl font-semibold">
							{isGerman
								? "Zentrale Kontaktstelle nach dem Digital Services Act - DSA (Verordnung (EU) 2022/265)"
								: "Central Contact Point pursuant to the Digital Services Act (DSA) – Regulation (EU) 2022/2065"}
						</h2>
						<p className="mb-4 text-lg">
							{isGerman
								? "Unsere zentrale Kontaktstelle für Nutzer und Behörden nach Art. 11, 12 DSA erreichen Sie wie folgt:"
								: "Our central contact point for users and authorities pursuant to Articles 11 and 12 DSA can be reached as follows:"}
						</p>
						<p className="mb-2 text-lg">
							{isGerman ? "E-Mail:" : "Email:"}{" "}
							<ProtectedEmail
								email="info@gcos.ai"
								className="text-primary hover:underline"
							/>
							<br />
							{isGerman ? "Telefon:" : "Phone:"}{" "}
							<ProtectedPhone
								phone="+49 174 2634157"
								className="text-primary hover:underline"
							/>
						</p>
						<p className="text-lg">
							{isGerman
								? "Die für den Kontakt zur Verfügung stehenden Sprachen sind: Deutsch, Englisch."
								: "Languages available for communication: German, English."}
						</p>
					</div>

					<Separator />

					<div>
						<h2 className="mb-4 text-2xl font-semibold">
							{isGerman ? "Haftung für Inhalte" : "Liability for Content"}
						</h2>
						<p className="text-lg">
							{isGerman
								? "Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen."
								: "The content of our website has been created with the utmost care. However, we cannot assume any liability for the accuracy, completeness, or currentness of the content."}
						</p>
					</div>

					<Separator />

					<div>
						<h2 className="mb-4 text-2xl font-semibold">
							{isGerman
								? "Haftung für externe Links"
								: "Liability for External Links"}
						</h2>
						<p className="text-lg">
							{isGerman
								? "Unsere Website enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich."
								: "Our website contains links to external third-party websites on whose content we have no influence. The respective provider or operator of the linked sites is always responsible for their content."}
						</p>
					</div>
				</div>
			</section>
		</div>
	);
}

