/** @type {import('tailwindcss').Config} */
const { plugin } = require("twrnc");
module.exports = {
	content: [],
	theme: {
		extend: {
			colors: {
				primary: "#4DAFFF",
				"content-primary": "#222222",
				"content-secondary": "#999999",
				"content-tertiary": "#A6A6A6",
				"content-quaternary": "#868686",
				border: "#EFEFEF",
				error: "#FF1631",
			},
		},
	},
	plugins: [
		plugin(({ addUtilities }) => {
			addUtilities({
				title1: `text-[1.75rem]`,
				title2: `text-[1.375rem]`,
				title3: `text-[1.25rem]`,
				headline: `text-[1.10625rem]`,
				body: `text-[1.10625rem]`,
				callout: `text-[1rem]`,
				subheadline: `text-[0.9375rem]`,
				footnote: `text-[0.8125rem]`,
				caption1: `text-[0.75rem]`,
				caption2: `text-[0.6875rem]`,
			});
		}),
	],
};
