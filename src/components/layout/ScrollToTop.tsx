import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";

export function ScrollToTop() {
	const location = useRouterState({
		select: (state) => state.location,
	});

	useEffect(() => {
		// Instant scroll to top without animation
		window.scrollTo(0, 0);
	}, [location.pathname]);

	return null;
}

