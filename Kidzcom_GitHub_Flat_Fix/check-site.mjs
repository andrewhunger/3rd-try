import { existsSync, readFileSync } from "node:fs";

const pages = [
  "index.html",
  "programmes.html",
  "holidays.html",
  "parent-info.html",
  "about.html",
  "blog.html",
  "july-holidays.html",
  "404.html",
];

const problems = [];

for (const page of pages) {
  const html = readFileSync(page, "utf8");
  const references = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);

  for (const reference of references) {
    if (/^(?:https?:|mailto:|tel:|#|data:)/.test(reference)) continue;
    const localFile = reference.split("#")[0].split("?")[0];
    if (localFile && !existsSync(localFile)) {
      problems.push(`${page}: broken reference ${reference}`);
    }
  }
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}

console.log(`Checked ${pages.length} flat pages: every local link and asset exists.`);
