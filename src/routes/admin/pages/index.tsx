import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/admin/DashboardLayout";
import { getPages } from "@/lib/server/pages";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { FileText, Check, X } from "lucide-react";

export const Route = createFileRoute("/admin/pages/")({
	component: PagesListPage,
});

function PagesListPage() {
	const navigate = useNavigate();

	const { data: pages = [], isLoading } = useQuery({
		queryKey: ["pages"],
		queryFn: () => getPages(),
	});

	return (
		<DashboardLayout>
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold">Pages</h1>
					<p className="text-muted-foreground">
						Manage static pages like Privacy Policy
					</p>
				</div>

				{isLoading ? (
					<div className="animate-pulse space-y-4">
						{[1, 2].map((i) => (
							<div key={i} className="h-16 bg-muted rounded" />
						))}
					</div>
				) : (
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[50px]" />
									<TableHead>Page</TableHead>
									<TableHead>English</TableHead>
									<TableHead>German</TableHead>
									<TableHead>Last Updated</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{pages.map((page) => (
									<TableRow key={page._id}>
										<TableCell>
											<FileText className="h-5 w-5 text-muted-foreground" />
										</TableCell>
										<TableCell>
											<div>
												<p className="font-medium">{page.labelEn}</p>
												<p className="text-sm text-muted-foreground">
													{page.labelDe}
												</p>
											</div>
										</TableCell>
										<TableCell>
											{page.contentEn ? (
												<Check className="h-4 w-4 text-green-600" />
											) : (
												<X className="h-4 w-4 text-muted-foreground" />
											)}
										</TableCell>
										<TableCell>
											{page.contentDe ? (
												<Check className="h-4 w-4 text-green-600" />
											) : (
												<X className="h-4 w-4 text-muted-foreground" />
											)}
										</TableCell>
										<TableCell>
											{page.updatedAt
												? new Date(page.updatedAt).toLocaleDateString()
												: "Never"}
										</TableCell>
										<TableCell className="text-right">
											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													navigate({ to: `/admin/pages/${page._id}` })
												}
											>
												Edit
											</Button>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</div>
		</DashboardLayout>
	);
}
