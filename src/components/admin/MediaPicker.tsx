import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getFiles, type S3File } from "@/lib/server/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Image as ImageIcon, Search, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaPickerProps {
	value?: string;
	onSelect: (url: string) => void;
	disabled?: boolean;
}

export function MediaPicker({ value, onSelect, disabled }: MediaPickerProps) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

	const { data: files = [], isLoading } = useQuery({
		queryKey: ["media"],
		queryFn: () => getFiles(),
		enabled: open, // Only fetch when dialog is open
	});

	// Filter to only show images and apply search
	const imageFiles = useMemo(() => {
		return files
			.filter((file) => file.type === "image")
			.filter((file) =>
				search ? file.name.toLowerCase().includes(search.toLowerCase()) : true
			);
	}, [files, search]);

	const handleSelect = () => {
		if (selectedUrl) {
			onSelect(selectedUrl);
			setOpen(false);
			setSelectedUrl(null);
			setSearch("");
		}
	};

	const handleImageClick = (url: string) => {
		setSelectedUrl(url === selectedUrl ? null : url);
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button type="button" variant="outline" disabled={disabled}>
					<ImageIcon className="mr-2 h-4 w-4" />
					{value ? "Change Image" : "Select Image"}
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
				<DialogHeader>
					<DialogTitle>Select Image</DialogTitle>
					<DialogDescription>
						Choose an image from your media library
					</DialogDescription>
				</DialogHeader>

				{/* Search */}
				<div className="relative">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search images..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-9"
					/>
				</div>

				{/* Image Grid */}
				<div className="flex-1 overflow-y-auto min-h-[300px]">
					{isLoading ? (
						<div className="flex items-center justify-center h-full">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
						</div>
					) : imageFiles.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-full text-muted-foreground">
							<ImageIcon className="h-12 w-12 mb-4" />
							<p>
								{search
									? "No images match your search"
									: "No images in your media library"}
							</p>
							<p className="text-sm mt-2">
								Upload images in the{" "}
								<a
									href="/admin/media"
									target="_blank"
									className="text-primary hover:underline"
								>
									Media Library
								</a>
							</p>
						</div>
					) : (
						<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-1">
							{imageFiles.map((file) => (
								<button
									key={file.key}
									type="button"
									onClick={() => handleImageClick(file.url)}
									className={cn(
										"relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
										selectedUrl === file.url
											? "border-primary ring-2 ring-primary"
											: "border-transparent hover:border-muted-foreground/50"
									)}
								>
									<img
										src={file.url}
										alt={file.name}
										className="h-full w-full object-cover"
										onError={(e) => {
											e.currentTarget.src = "/images/Profile-Picture-Placeholder.webp";
										}}
									/>
									{selectedUrl === file.url && (
										<div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
											<div className="bg-primary text-primary-foreground rounded-full p-1">
												<Check className="h-4 w-4" />
											</div>
										</div>
									)}
									<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
										<p className="text-xs text-white truncate">{file.name}</p>
									</div>
								</button>
							))}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="flex justify-between items-center pt-4 border-t">
					<p className="text-sm text-muted-foreground">
						{imageFiles.length} image{imageFiles.length !== 1 ? "s" : ""} available
					</p>
					<div className="flex gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								setOpen(false);
								setSelectedUrl(null);
								setSearch("");
							}}
						>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={handleSelect}
							disabled={!selectedUrl}
						>
							Select Image
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
