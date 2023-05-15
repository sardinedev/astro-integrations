import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { tiny } from "./tiny";
import type { AstroIntegration } from "astro";

export default function tinyCSS(): AstroIntegration {
	return {
		name: "tinyCSS-integration",
		hooks: {
			// "astro:config:setup": ({ updateConfig }) => {
			//   updateConfig({
			//     vite: {
			//       plugins: [
			//         tinyCSS(),
			//         Inspect({
			//           build: true,
			//           outputDir: ".vite-inspect",
			//         }),
			//       ],
			//     },
			//   });
			// },
			"astro:build:done": async ({ routes }) => {
				for (const route of routes) {
					if (route.type !== "page") {
						continue;
					}
					const outFile = fileURLToPath(new URL("index.html", route.distURL));
					const html = await readFile(outFile, { encoding: "utf-8" });
					const optimised = await tiny(html, { output: "dist" });
					await writeFile(outFile, optimised);
				}
			},
		},
	};
}
