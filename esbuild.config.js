const esbuild = require("esbuild");
const fs = require("fs");

// ===== Copy static files =====
function copyStatic() {
  const srcDir = "public";
  const outDir = "dist";

  if (!fs.existsSync(srcDir)) return;

  fs.cpSync(srcDir, outDir, { recursive: true });
  console.log("Static files copied.");
}

copyStatic();

// ===== Build config =====
const buildOptions = {
  entryPoints: {
    "background/index": "src/background/index.ts",
    "content/index": "src/content/index.ts",
  },
  bundle: true,
  outdir: "dist",
  format: "esm",           
  target: "es2020",
  splitting: false,
  sourcemap: false,
  minify: true,
  drop: ["console"],        
  treeShaking: true,
  entryNames: "[dir]/[name]",
  define: {
    "process.env.NODE_ENV": '"production"'  
  }
};

// ===== Build or watch =====
const args = process.argv.slice(2);
if (args.includes("--watch")) {
  esbuild.context(buildOptions).then(ctx => {
    ctx.watch();
    console.log("Watching for changes...");
  }).catch(() => process.exit(1));
} else {
  esbuild.build(buildOptions).then(() => {
    console.log("Build success!");
  }).catch(() => process.exit(1));
}
