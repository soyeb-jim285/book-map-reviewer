import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseQuestionsByTopic, type QuestionEntry } from "../src/lib/parse";
import { FIGURES_DIR, QUESTIONS_OUTPUTS_DIR } from "../src/lib/paths";

const buildDir = path.join(process.cwd(), ".question-build");
const outputDir = path.join(process.cwd(), "public", "review-assets", "questions", "rendered");

function run(command: string, args: string[], cwd: string) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  if (result.status === 0) return true;
  console.warn(`failed: ${command} ${args.join(" ")}`);
  const stderr = result.stderr || "";
  if (stderr.trim()) console.warn(stderr.slice(-1200));
  return false;
}

function printLatexError(logPath: string) {
  if (!fs.existsSync(logPath)) return;
  const lines = fs.readFileSync(logPath, "utf8").split(/\r?\n/);
  const index = lines.findIndex((line) => line.startsWith("!") || line.includes("LaTeX Error"));
  if (index >= 0) console.warn(lines.slice(Math.max(0, index - 2), index + 8).join("\n"));
}

function prepareBuildDir() {
  fs.mkdirSync(buildDir, { recursive: true });
  fs.mkdirSync(outputDir, { recursive: true });
  fs.cpSync(path.join(QUESTIONS_OUTPUTS_DIR, "components.tex"), path.join(buildDir, "components.tex"));
  fs.cpSync(FIGURES_DIR, path.join(buildDir, "figures"), { recursive: true });
}

function stripQuestionWrapper(latex: string) {
  return latex
    .replace(/\\marks\{([^}]*)\}/g, "\\quad\\textbf{[$1]}")
    .replace(/^\\q\{[^}]+\}\\srctag\{([^}]+)\}\\quad\s*/, "{\\bfseries Source: $1}\\par\\medskip\n");
}

function wrapper(questionLatex: string) {
  return String.raw`\documentclass[preview,border=8pt,varwidth=17cm]{standalone}
\usepackage[T1]{fontenc}
\usepackage[utf8]{inputenc}
\usepackage{amsmath,amssymb,mathtools,graphicx,float,enumitem,xcolor,tikz}
\usetikzlibrary{arrows.meta,positioning,calc,shapes.geometric,shapes.misc,decorations.pathmorphing,decorations.markings,shapes.multipart,fit,backgrounds,patterns,patterns.meta}
\input{components.tex}
\definecolor{accent}{RGB}{18,72,128}
\newcommand{\srctag}[1]{\,{\small\itshape\color{accent!85}[#1]}}
\newcommand{\spans}[1]{\par\smallskip{\footnotesize\color{black!60}\textit{Spans topics:} #1}}
\newcommand{\q}[1]{\par\noindent\textbf{#1.}\quad}
\newenvironment{sublist}{\begin{list}{}{\setlength{\leftmargin}{2em}\setlength{\labelsep}{0.4em}\setlength{\labelwidth}{1.6em}\setlength{\itemsep}{0.45em}\setlength{\topsep}{3pt}}}{\end{list}}
\newcommand{\sq}[1]{\item[\textbf{(#1)}]}
\newcommand{\figref}[2]{\begin{tabular}{@{}c@{}}\input{#2}\\[2pt]{\scriptsize\color{accent}\bfseries[\,Fig~#1\,]}\end{tabular}}
\setlength{\parindent}{0pt}
\begin{document}
\small
${stripQuestionWrapper(questionLatex)}
\end{document}
`;
}

function main() {
  prepareBuildDir();
  const questions = parseQuestionsByTopic();
  const seen = new Map<string, QuestionEntry>();
  for (const entries of questions.values()) {
    for (const entry of entries) seen.set(entry.previewKey, entry);
  }

  let rendered = 0;
  for (const [key, entry] of seen.entries()) {
    const name = path.basename(key, ".png");
    const texPath = path.join(buildDir, `${name}.tex`);
    fs.writeFileSync(texPath, wrapper(entry.latex), "utf8");
    if (!run("pdflatex", ["-interaction=nonstopmode", `${name}.tex`], buildDir)) {
      printLatexError(path.join(buildDir, `${name}.log`));
      continue;
    }
    const pdfPath = path.join(buildDir, `${name}.pdf`);
    const pngPrefix = path.join(outputDir, name);
    if (run("pdftocairo", ["-png", "-singlefile", "-r", "180", pdfPath, pngPrefix], buildDir)) rendered += 1;
  }
  console.log(`Rendered ${rendered}/${seen.size} question previews.`);
  if (rendered !== seen.size) process.exitCode = 1;
}

main();
