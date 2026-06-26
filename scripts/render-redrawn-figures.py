import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROJECT = ROOT.parent
OUT = PROJECT / "Questions" / "outputs"
FIGURES = OUT / "figures"
BUILD = ROOT / ".figure-build"
SVG_OUT = ROOT / "public" / "review-assets" / "redrawn-svg"
PNG_OUT = ROOT / "public" / "review-assets" / "redrawn-png"


def run(cmd: list[str], cwd: Path) -> bool:
    try:
        subprocess.run(cmd, cwd=cwd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError) as exc:
        print(f"failed: {' '.join(cmd)}")
        if isinstance(exc, subprocess.CalledProcessError):
            print(exc.stderr.decode(errors="ignore")[-1200:])
        return False


def main() -> None:
    BUILD.mkdir(exist_ok=True)
    SVG_OUT.mkdir(parents=True, exist_ok=True)
    PNG_OUT.mkdir(parents=True, exist_ok=True)
    shutil.copy2(OUT / "components.tex", BUILD / "components.tex")
    rendered = 0
    for tikz in sorted(FIGURES.glob("*.tex")):
        key = tikz.stem
        wrapper = BUILD / f"{key}.tex"
        rel = tikz.relative_to(BUILD) if False else tikz
        wrapper.write_text(
            "\\documentclass[tikz,border=6pt]{standalone}\n"
            "\\usepackage{amsmath,amssymb,mathtools,xcolor}\n"
            "\\usepackage{tikz}\n"
            "\\input{components.tex}\n"
            "\\begin{document}\n"
            f"\\input{{{rel.as_posix()}}}\n"
            "\\end{document}\n",
            encoding="utf8",
        )
        if not run(["pdflatex", "-interaction=nonstopmode", wrapper.name], BUILD):
            continue
        pdf = BUILD / f"{key}.pdf"
        svg = SVG_OUT / f"{key}.svg"
        png_prefix = PNG_OUT / key
        if shutil.which("pdftocairo"):
            run(["pdftocairo", "-svg", str(pdf), str(svg)], BUILD)
            if run(["pdftocairo", "-png", "-singlefile", "-r", "220", str(pdf), str(png_prefix)], BUILD):
                rendered += 1
        else:
            shutil.copy2(pdf, PNG_OUT / f"{key}.pdf")
            rendered += 1
    print(f"Rendered {rendered} TikZ figures.")


if __name__ == "__main__":
    main()
