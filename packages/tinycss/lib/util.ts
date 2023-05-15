import { PurgeCSS } from "purgecss";
import browserslist from "browserslist";
import {
	transform,
	browserslistToTargets,
	transformStyleAttribute,
} from "lightningcss";
import { promises } from "node:fs";
import type { OptionsInterface } from "./tiny.types";
import type { UserDefinedOptions as PurgeCSSOptions } from "purgecss";

/**
 * Transforms the CSS to a production ready state.
 * - PurgeCSS removes all unused CSS.
 * - Autoprefixer applies vendor specific prefixes
 * - CSSNano minifies the remaining CSS
 * @param {string} rawCss The page CSS content
 * @param {string} html The raw HTML content
 */
export async function minify(
	rawCss: string,
	html: string,
	options: OptionsInterface,
): Promise<string | undefined> {
	try {
		const userPurgeCSSOptions = options?.purgeCSS ?? {};

		const targets = browserslistToTargets(
			browserslist(options?.browserslists ?? null),
		);

		const { code } = transform({
			filename: "style.css",
			code: Buffer.from(rawCss),
			minify: true,
			targets,
			drafts: {
				nesting: true,
			},
		});

		const purgeCSSOptions: PurgeCSSOptions = {
			content: [
				{
					raw: html,
					extension: "html",
				},
			],
			css: [{ raw: code.toString() }],
		};

		Object.assign(purgeCSSOptions, userPurgeCSSOptions);

		const purged = await new PurgeCSS().purge(purgeCSSOptions);
		const css = purged[0]?.css;

		return css;
	} catch (error) {
		console.error(error);
		throw error;
	}
}

/**
 * Loads an external CSS file and returns the CSS content
 * @param link The URL for an external CSS
 */
export function getExternalFiles(link: HTMLLinkElement, root: string) {
	const src = root + link.href;
	return promises.readFile(src, { encoding: "utf-8" });
}
