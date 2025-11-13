import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
	const [theme, setTheme] = useState<'light' | 'dark'>('light')
	const [mounted, setMounted] = useState(false)

	useEffect(() => {
		setMounted(true)
		// Check for saved theme preference or default to light mode
		const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
		const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light')
		setTheme(initialTheme)
		updateTheme(initialTheme)
	}, [])

	const updateTheme = (newTheme: 'light' | 'dark') => {
		const root = document.documentElement
		if (newTheme === 'dark') {
			root.classList.add('dark')
		} else {
			root.classList.remove('dark')
		}
		localStorage.setItem('theme', newTheme)
	}

	const toggleTheme = () => {
		const newTheme = theme === 'dark' ? 'light' : 'dark'
		setTheme(newTheme)
		updateTheme(newTheme)
	}

	if (!mounted) {
		return (
			<Button variant="ghost" size="icon" className="h-9 w-9">
				<span className="sr-only">Toggle theme</span>
			</Button>
		)
	}

	return (
		<Button
			variant="ghost"
			size="icon"
			className="h-9 w-9"
			onClick={toggleTheme}
		>
			<Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
			<Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
			<span className="sr-only">Toggle theme</span>
		</Button>
	)
}

