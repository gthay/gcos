import { motion, AnimatePresence } from "framer-motion";
import { useRouterState } from "@tanstack/react-router";

interface PageTransitionProps {
	children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
	const location = useRouterState({
		select: (state) => state.location.pathname,
	});

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={location}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.2, ease: "easeInOut" }}
			>
				{children}
			</motion.div>
		</AnimatePresence>
	);
}




