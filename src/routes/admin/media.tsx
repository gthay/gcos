import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useRef, useCallback } from "react";
import { DashboardLayout } from "@/components/admin/DashboardLayout";
import { getFiles, deleteFile, uploadFile, updateMediaNoindex, type S3File, type MediaUsage } from "@/lib/server/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getMediaUrl } from "@/lib/media-utils";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Trash2,
	ExternalLink,
	Copy,
	Search,
	Image,
	FileVideo,
	FileAudio,
	FileText,
	Archive,
	File,
	ArrowUpDown,
	ArrowUp,
	ArrowDown,
	RefreshCw,
	Upload,
	X,
	Loader2,
	EyeOff,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/media")({
	component: MediaPage,
});

type SortField = "name" | "size" | "lastModified" | "type";
type SortDirection = "asc" | "desc";

function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatDate(dateString: string): string {
	if (!dateString) return "-";
	const date = new Date(dateString);
	return date.toLocaleDateString("de-DE", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	})
}

function getFileIcon(type: string) {
	switch (type) {
		case "image":
			return <Image className="h-4 w-4 text-green-500" />;
		case "video":
			return <FileVideo className="h-4 w-4 text-purple-500" />;
		case "audio":
			return <FileAudio className="h-4 w-4 text-blue-500" />;
		case "document":
			return <FileText className="h-4 w-4 text-orange-500" />;
		case "archive":
			return <Archive className="h-4 w-4 text-yellow-500" />;
		default:
			return <File className="h-4 w-4 text-muted-foreground" />;
	}
}

function getFileTypeFromMime(mimeType: string): string {
	if (mimeType.startsWith("image/")) return "image";
	if (mimeType.startsWith("video/")) return "video";
	if (mimeType.startsWith("audio/")) return "audio";
	if (
		mimeType.includes("pdf") ||
		mimeType.includes("document") ||
		mimeType.includes("text/") ||
		mimeType.includes("spreadsheet") ||
		mimeType.includes("presentation")
	) {
		return "document";
	}
	if (mimeType.includes("zip") || mimeType.includes("archive") || mimeType.includes("compressed")) {
		return "archive";
	}
	return "other";
}

function getUsageEditUrl(usage: MediaUsage): string {
	switch (usage.type) {
		case "project":
			return `/admin/projects/${usage.id}`;
		case "teamMember":
			return `/admin/team-members/${usage.id}`;
		case "course":
			return `/admin/courses/${usage.id}`;
		case "blogPost":
			return `/admin/blog-posts/${usage.id}`;
		default:
			return "#";
	}
}

function getUsageTypeLabel(type: MediaUsage["type"]): string {
	switch (type) {
		case "project":
			return "Project";
		case "teamMember":
			return "Team";
		case "course":
			return "Course";
		case "blogPost":
			return "Blog";
		default:
			return type;
	}
}

function MediaPage() {
	const queryClient = useQueryClient();
	const [search, setSearch] = useState("");
	const [typeFilter, setTypeFilter] = useState<string>("all");
	const [sortField, setSortField] = useState<SortField>("lastModified");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
	const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
	const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
	const [isDragging, setIsDragging] = useState(false);
	const [isPageDragging, setIsPageDragging] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const dragCounter = useRef(0);

	const { data: files = [], isLoading, isError, error, refetch } = useQuery({
		queryKey: ["media"],
		queryFn: () => getFiles(),
	})

	const deleteMutation = useMutation({
		mutationFn: (key: string) => deleteFile({ data: key }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["media"] });
			toast.success("File deleted");
		},
		onError: (error) => {
			toast.error("Failed to delete file", {
				description: error instanceof Error ? error.message : "An error occurred",
			});
		},
	});

	const uploadMutation = useMutation({
		mutationFn: async (file: File) => {
			// Convert file to base64
			const buffer = await file.arrayBuffer();
			const base64 = btoa(
				new Uint8Array(buffer).reduce(
					(data, byte) => data + String.fromCharCode(byte),
					""
				)
			);

			return uploadFile({
				data: {
					fileName: file.name,
					fileData: base64,
					contentType: file.type || "application/octet-stream",
				},
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["media"] });
		},
	});

	const noindexMutation = useMutation({
		mutationFn: ({ s3Key, noindex }: { s3Key: string; noindex: boolean }) =>
			updateMediaNoindex({ data: { s3Key, noindex } }),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["media"] });
			toast.success(
				variables.noindex
					? "File hidden from search engines"
					: "File visible to search engines"
			);
		},
		onError: (error) => {
			toast.error("Failed to update noindex setting", {
				description: error instanceof Error ? error.message : "An error occurred",
			});
		},
	});

	const handleUploadFiles = async () => {
		if (selectedFiles.length === 0) return;

		const results = await Promise.allSettled(
			selectedFiles.map((file) => uploadMutation.mutateAsync(file))
		)

		const succeeded = results.filter((r) => r.status === "fulfilled").length;
		const failed = results.filter((r) => r.status === "rejected").length;

		if (succeeded > 0) {
			toast.success(`${succeeded} file${succeeded > 1 ? "s" : ""} uploaded successfully`);
		}
		if (failed > 0) {
			toast.error(`${failed} file${failed > 1 ? "s" : ""} failed to upload`);
		}

		setSelectedFiles([]);
		setUploadDialogOpen(false);
	}

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		setSelectedFiles((prev) => [...prev, ...files]);
	}

	const handleRemoveFile = (index: number) => {
		setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
	}

	const handleDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	}, []);

	const handleDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	}, []);

	const handleDrop = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		const files = Array.from(e.dataTransfer.files);
		setSelectedFiles((prev) => [...prev, ...files]);
	}, []);

	// Page-level drag handlers for dropping files anywhere on the page
	const handlePageDragEnter = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		dragCounter.current++;
		if (e.dataTransfer.types.includes("Files")) {
			setIsPageDragging(true);
		}
	}, []);

	const handlePageDragLeave = useCallback((e: React.DragEvent) => {
		e.preventDefault();
		dragCounter.current--;
		if (dragCounter.current === 0) {
			setIsPageDragging(false);
		}
	}, []);

	const handlePageDragOver = useCallback((e: React.DragEvent) => {
		e.preventDefault();
	}, []);

	const handlePageDrop = useCallback(
		async (e: React.DragEvent) => {
			e.preventDefault();
			dragCounter.current = 0;
			setIsPageDragging(false);

			const droppedFiles = Array.from(e.dataTransfer.files);
			if (droppedFiles.length === 0) return;

			// Upload files directly
			const results = await Promise.allSettled(
				droppedFiles.map(async (file) => {
					const buffer = await file.arrayBuffer();
					const base64 = btoa(
						new Uint8Array(buffer).reduce(
							(data, byte) => data + String.fromCharCode(byte),
							""
						)
					);
					return uploadFile({
						data: {
							fileName: file.name,
							fileData: base64,
							contentType: file.type || "application/octet-stream",
						},
					});
				})
			);

			const succeeded = results.filter((r) => r.status === "fulfilled").length;
			const failed = results.filter((r) => r.status === "rejected").length;

			if (succeeded > 0) {
				queryClient.invalidateQueries({ queryKey: ["media"] });
				toast.success(
					`${succeeded} file${succeeded > 1 ? "s" : ""} uploaded successfully`
				);
			}
			if (failed > 0) {
				toast.error(`${failed} file${failed > 1 ? "s" : ""} failed to upload`);
			}
		},
		[queryClient]
	);

	const handleCopyUrl = (url: string) => {
		navigator.clipboard.writeText(url);
		toast.success("URL copied to clipboard");
	}

	const handleSort = (field: SortField) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("asc");
		}
	}

	const getSortIcon = (field: SortField) => {
		if (sortField !== field) {
			return <ArrowUpDown className="h-4 w-4 ml-1 opacity-50" />;
		}
		return sortDirection === "asc" ? (
			<ArrowUp className="h-4 w-4 ml-1" />
		) : (
			<ArrowDown className="h-4 w-4 ml-1" />
		)
	}

	const filteredAndSortedFiles = useMemo(() => {
		let result = [...files];

		// Filter by search
		if (search) {
			const searchLower = search.toLowerCase();
			result = result.filter((file) =>
				file.name.toLowerCase().includes(searchLower)
			)
		}

		// Filter by type
		if (typeFilter !== "all") {
			result = result.filter((file) => file.type === typeFilter);
		}

		// Sort
		result.sort((a, b) => {
			let comparison = 0;
			switch (sortField) {
				case "name":
					comparison = a.name.localeCompare(b.name);
					break
				case "size":
					comparison = a.size - b.size;
					break
				case "lastModified":
					comparison = new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime();
					break
				case "type":
					comparison = a.type.localeCompare(b.type);
					break
			}
			return sortDirection === "asc" ? comparison : -comparison;
		})

		return result;
	}, [files, search, typeFilter, sortField, sortDirection]);

	const fileTypes = useMemo(() => {
		const types = new Set(files.map((f) => f.type));
		return Array.from(types).sort();
	}, [files]);

	const totalSize = useMemo(() => {
		return files.reduce((acc, file) => acc + file.size, 0);
	}, [files]);

	if (isLoading) {
		return (
			<DashboardLayout>
				<div className="flex items-center justify-center py-12">
					<RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
					<span className="ml-2 text-muted-foreground">Loading files...</span>
				</div>
			</DashboardLayout>
		)
	}

	if (isError) {
		return (
			<DashboardLayout>
				<div className="space-y-6">
					<div>
						<h1 className="text-3xl font-bold">Media</h1>
						<p className="text-muted-foreground">Manage your media files</p>
					</div>
					<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
						<p className="text-destructive font-medium">Failed to load files</p>
						<p className="text-sm text-muted-foreground mt-1">
							{error instanceof Error ? error.message : "Check your S3 configuration"}
						</p>
						<Button variant="outline" className="mt-4" onClick={() => refetch()}>
							<RefreshCw className="h-4 w-4 mr-2" />
							Retry
						</Button>
					</div>
				</div>
			</DashboardLayout>
		)
	}

	return (
		<DashboardLayout>
			<div
				className="space-y-6 relative"
				onDragEnter={handlePageDragEnter}
				onDragLeave={handlePageDragLeave}
				onDragOver={handlePageDragOver}
				onDrop={handlePageDrop}
			>
				{/* Full-page drop overlay */}
				{isPageDragging && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
						<div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-primary bg-primary/5 p-12">
							<Upload className="h-16 w-16 text-primary" />
							<p className="text-xl font-medium text-primary">
								Drop files to upload
							</p>
						</div>
					</div>
				)}

				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">Media</h1>
						<p className="text-muted-foreground">
							{files.length} files • {formatFileSize(totalSize)} total
						</p>
					</div>
					<div className="flex gap-2">
						<Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
							<DialogTrigger asChild>
								<Button>
									<Upload className="h-4 w-4 mr-2" />
									Upload Media
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-lg">
								<DialogHeader>
									<DialogTitle>Upload Media</DialogTitle>
									<DialogDescription>
										Select files to upload to your media storage.
									</DialogDescription>
								</DialogHeader>
								<div className="space-y-4">
									{/* Drop zone */}
									<div
										className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
											isDragging
												? "border-primary bg-primary/5"
												: "border-muted-foreground/25 hover:border-muted-foreground/50"
										}`}
										onDragOver={handleDragOver}
										onDragLeave={handleDragLeave}
										onDrop={handleDrop}
									>
										<Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
										<p className="text-sm text-muted-foreground mb-2">
											Drag and drop files here, or
										</p>
										<Button
											variant="outline"
											size="sm"
											onClick={() => fileInputRef.current?.click()}
										>
											Browse Files
										</Button>
										<input
											ref={fileInputRef}
											type="file"
											multiple
											className="hidden"
											onChange={handleFileSelect}
										/>
									</div>

									{/* Selected files list */}
									{selectedFiles.length > 0 && (
										<div className="space-y-2">
											<Label>Selected Files ({selectedFiles.length})</Label>
											<div className="max-h-48 overflow-y-auto space-y-2">
												{selectedFiles.map((file, index) => (
													<div
														key={"${file.name}-${index}"}
														className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm"
													>
														<div className="flex items-center gap-2 min-w-0">
															{getFileIcon(getFileTypeFromMime(file.type))}
															<span className="truncate">{file.name}</span>
															<span className="text-muted-foreground shrink-0">
																({formatFileSize(file.size)})
															</span>
														</div>
														<Button
															variant="ghost"
															size="icon"
															className="h-6 w-6 shrink-0"
															onClick={() => handleRemoveFile(index)}
														>
															<X className="h-4 w-4" />
														</Button>
													</div>
												))}
											</div>
										</div>
									)}

									{/* Upload button */}
									<Button
										className="w-full"
										onClick={handleUploadFiles}
										disabled={selectedFiles.length === 0 || uploadMutation.isPending}
									>
										{uploadMutation.isPending ? (
											<>
												<Loader2 className="h-4 w-4 mr-2 animate-spin" />
												Uploading...
											</>
										) : (
											<>
												<Upload className="h-4 w-4 mr-2" />
												Upload {selectedFiles.length > 0 ? `${selectedFiles.length} File${selectedFiles.length > 1 ? "s" : ""}` : "Files"}
											</>
										)}
									</Button>
								</div>
							</DialogContent>
						</Dialog>
						<Button variant="outline" onClick={() => refetch()}>
							<RefreshCw className="h-4 w-4 mr-2" />
							Refresh
						</Button>
					</div>
				</div>

				{/* Filters */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Search files..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-9"
						/>
					</div>
					<Select value={typeFilter} onValueChange={setTypeFilter}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Filter by type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All types</SelectItem>
							{fileTypes.map((type) => (
								<SelectItem key={type} value={type}>
									{type.charAt(0).toUpperCase() + type.slice(1)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Files Table */}
				{filteredAndSortedFiles.length === 0 ? (
					<div className="text-center py-12 border rounded-lg">
						<File className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
						<p className="text-muted-foreground">
							{search || typeFilter !== "all"
								? "No files match your filters"
								: "No files in storage"}
						</p>
					</div>
				) : (
					<div className="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[40px]">Type</TableHead>
									<TableHead>
										<button
											className="flex items-center hover:text-foreground"
											onClick={() => handleSort("name")}
										>
											Name
											{getSortIcon("name")}
										</button>
									</TableHead>
									<TableHead>
										<button
											className="flex items-center hover:text-foreground"
											onClick={() => handleSort("size")}
										>
											Size
											{getSortIcon("size")}
										</button>
									</TableHead>
									<TableHead>
										<button
											className="flex items-center hover:text-foreground"
											onClick={() => handleSort("lastModified")}
										>
											Modified
											{getSortIcon("lastModified")}
										</button>
									</TableHead>
									<TableHead>Used In</TableHead>
									<TableHead className="w-[100px]">
										<div className="flex items-center gap-1" title="Hide from search engines">
											<EyeOff className="h-4 w-4" />
											noindex
										</div>
									</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredAndSortedFiles.map((file) => (
									<TableRow key={file.key}>
										<TableCell>{getFileIcon(file.type)}</TableCell>
										<TableCell className="font-medium">
											<div className="flex items-center gap-2">
												{file.type === "image" && (
													<img
														src={getMediaUrl(file.key)}
														alt={file.name}
														className="h-8 w-8 rounded object-cover border"
														onError={(e) => {
															e.currentTarget.style.display = "none"
														}}
													/>
												)}
												<span className="truncate max-w-[300px]" title={file.name}>
													{file.name}
												</span>
											</div>
										</TableCell>
										<TableCell className="text-muted-foreground">
											{formatFileSize(file.size)}
										</TableCell>
										<TableCell className="text-muted-foreground">
											{formatDate(file.lastModified)}
										</TableCell>
										<TableCell>
											{file.usedBy.length === 0 ? (
												<span className="text-xs text-muted-foreground italic">Not used</span>
											) : (
												<div className="flex flex-col gap-1">
													{file.usedBy.slice(0, 3).map((usage, idx) => (
														<Link
															key={`${usage.type}-${usage.id}-${idx}`}
															to={getUsageEditUrl(usage)}
															className="text-xs text-primary hover:underline truncate max-w-[150px]"
															title={`${getUsageTypeLabel(usage.type)}: ${usage.name}`}
														>
															{getUsageTypeLabel(usage.type)}: {usage.name}
														</Link>
													))}
													{file.usedBy.length > 3 && (
														<span className="text-xs text-muted-foreground">
															+{file.usedBy.length - 3} more
														</span>
													)}
												</div>
											)}
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Switch
													checked={file.noindex}
													onCheckedChange={(checked) =>
														noindexMutation.mutate({
															s3Key: file.key,
															noindex: checked,
														})
													}
													disabled={noindexMutation.isPending}
												/>
											</div>
										</TableCell>
										<TableCell>
											<div className="flex justify-end gap-1">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => handleCopyUrl(getMediaUrl(file.key))}
													title="Copy URL"
												>
													<Copy className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													asChild
													title="Open in new tab"
												>
													<a href={getMediaUrl(file.key)} target="_blank" rel="noopener noreferrer">
														<ExternalLink className="h-4 w-4" />
													</a>
												</Button>
												{file.usedBy.length > 0 ? (
													<Button
														variant="ghost"
														size="icon"
														disabled
														title={`Cannot delete: Used by ${file.usedBy.length} item(s)`}
													>
														<Trash2 className="h-4 w-4 text-muted-foreground" />
													</Button>
												) : (
													<AlertDialog>
														<AlertDialogTrigger asChild>
															<Button variant="ghost" size="icon" title="Delete">
																<Trash2 className="h-4 w-4 text-destructive" />
															</Button>
														</AlertDialogTrigger>
														<AlertDialogContent>
															<AlertDialogHeader>
																<AlertDialogTitle>Delete File</AlertDialogTitle>
																<AlertDialogDescription>
																	Are you sure you want to delete "{file.name}"? This action cannot be undone.
																</AlertDialogDescription>
															</AlertDialogHeader>
															<AlertDialogFooter>
																<AlertDialogCancel>Cancel</AlertDialogCancel>
																<AlertDialogAction
																	onClick={() => deleteMutation.mutate(file.key)}
																	className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
																>
																	Delete
																</AlertDialogAction>
															</AlertDialogFooter>
														</AlertDialogContent>
													</AlertDialog>
												)}
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					</div>
				)}
			</div>
		</DashboardLayout>
	)
}


