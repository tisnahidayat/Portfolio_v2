/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		screens: {
			xs: "360px",
			sm: "640px",
			md: "768px",
			lg: "1024px",
			xl: "1280px",
			"2xl": "1536px",
		},
		extend: {
			backdropBlur: {
				sm: '4px',
			},
			keyframes: {
				scrollLine: {
					'0%':   { transform: 'translateY(-100%)', opacity: '1' },
					'100%': { transform: 'translateY(400%)',  opacity: '0' },
				},
				fadeIn: {
					'0%':   { opacity: '0' },
					'100%': { opacity: '1' },
				},
			},
			animation: {
				scrollLine: 'scrollLine 1.5s ease-in-out infinite',
				fadeIn: 'fadeIn 1s ease forwards',
			},
		},
		},
	plugins: [],
}
