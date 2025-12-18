import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import {
	Bold,
	Italic,
	List,
	ListOrdered,
	Heading2,
	Heading3,
	Quote,
	Code,
	Link as LinkIcon,
	Undo,
	Redo,
	Minus,
} from "lucide-react";

interface RichTextEditorProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
}

export function RichTextEditor({
	value,
	onChange,
	placeholder = "Write something...",
	disabled = false,
	className,
}: RichTextEditorProps) {
	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: {
					levels: [2, 3],
				},
			}),
			Placeholder.configure({
				placeholder,
			}),
			Link.configure({
				openOnClick: false,
				HTMLAttributes: {
					class: "text-primary underline",
				},
			}),
		],
		content: value,
		editable: !disabled,
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
		},
		editorProps: {
			attributes: {
				class:
					"prose prose-sm dark:prose-invert max-w-none min-h-[200px] p-3 focus:outline-none",
			},
		},
	});

	// Update editor content when value changes externally
	useEffect(() => {
		if (editor && value !== editor.getHTML()) {
			editor.commands.setContent(value);
		}
	}, [value, editor]);

	// Update editable state
	useEffect(() => {
		if (editor) {
			editor.setEditable(!disabled);
		}
	}, [disabled, editor]);

	if (!editor) {
		return null;
	}

	const addLink = () => {
		const url = window.prompt("Enter URL:");
		if (url) {
			editor.chain().focus().setLink({ href: url }).run();
		}
	};

	return (
		<div
			className={cn(
				"rounded-md border border-input bg-background",
				disabled && "opacity-50 cursor-not-allowed",
				className
			)}
		>
			{/* Toolbar */}
			<div className="flex flex-wrap items-center gap-1 border-b border-input p-2 bg-muted/30">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleBold().run()}
					disabled={disabled}
					className={cn(
						"h-8 w-8 p-0",
						editor.isActive("bold") && "bg-accent"
					)}
					title="Bold"
				>
					<Bold className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleItalic().run()}
					disabled={disabled}
					className={cn(
						"h-8 w-8 p-0",
						editor.isActive("italic") && "bg-accent"
					)}
					title="Italic"
				>
					<Italic className="h-4 w-4" />
				</Button>

				<div className="w-px h-6 bg-border mx-1" />

				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 2 }).run()
					}
					disabled={disabled}
					className={cn(
						"h-8 w-8 p-0",
						editor.isActive("heading", { level: 2 }) && "bg-accent"
					)}
					title="Heading 2"
				>
					<Heading2 className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() =>
						editor.chain().focus().toggleHeading({ level: 3 }).run()
					}
					disabled={disabled}
					className={cn(
						"h-8 w-8 p-0",
						editor.isActive("heading", { level: 3 }) && "bg-accent"
					)}
					title="Heading 3"
				>
					<Heading3 className="h-4 w-4" />
				</Button>

				<div className="w-px h-6 bg-border mx-1" />

				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					disabled={disabled}
					className={cn(
						"h-8 w-8 p-0",
						editor.isActive("bulletList") && "bg-accent"
					)}
					title="Bullet List"
				>
					<List className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					disabled={disabled}
					className={cn(
						"h-8 w-8 p-0",
						editor.isActive("orderedList") && "bg-accent"
					)}
					title="Numbered List"
				>
					<ListOrdered className="h-4 w-4" />
				</Button>

				<div className="w-px h-6 bg-border mx-1" />

				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleBlockquote().run()}
					disabled={disabled}
					className={cn(
						"h-8 w-8 p-0",
						editor.isActive("blockquote") && "bg-accent"
					)}
					title="Quote"
				>
					<Quote className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().toggleCodeBlock().run()}
					disabled={disabled}
					className={cn(
						"h-8 w-8 p-0",
						editor.isActive("codeBlock") && "bg-accent"
					)}
					title="Code Block"
				>
					<Code className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={addLink}
					disabled={disabled}
					className={cn(
						"h-8 w-8 p-0",
						editor.isActive("link") && "bg-accent"
					)}
					title="Add Link"
				>
					<LinkIcon className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().setHorizontalRule().run()}
					disabled={disabled}
					className="h-8 w-8 p-0"
					title="Horizontal Rule"
				>
					<Minus className="h-4 w-4" />
				</Button>

				<div className="flex-1" />

				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().undo().run()}
					disabled={disabled || !editor.can().undo()}
					className="h-8 w-8 p-0"
					title="Undo"
				>
					<Undo className="h-4 w-4" />
				</Button>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					onClick={() => editor.chain().focus().redo().run()}
					disabled={disabled || !editor.can().redo()}
					className="h-8 w-8 p-0"
					title="Redo"
				>
					<Redo className="h-4 w-4" />
				</Button>
			</div>

			{/* Editor Content */}
			<EditorContent editor={editor} />
		</div>
	);
}







