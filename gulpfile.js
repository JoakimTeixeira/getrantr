const browserSync = require("browser-sync").create();
const gulp = require("gulp");
const nodemon = require("gulp-nodemon");
const gulpSass = require("gulp-sass")(require("sass"));
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

function generateDevtoolsWorkspaceConfig(cb) {
  const projectRoot = __dirname;
  const config = {
    workspace: {
      root: projectRoot,
      uuid: crypto.randomUUID(),
    },
  };

  const configDir = path.join(__dirname, "src/public/.well-known/appspecific");
  const configPath = path.join(configDir, "com.chrome.devtools.json");

  try {
    fs.mkdirSync(configDir, { recursive: true });
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    cb();
  } catch (error) {
    console.error("Error creating DevTools Workspace config:", error);
    cb(error);
  }
}

function sass() {
  return gulp
    .src("./src/public/styles/index.scss")
    .pipe(
      gulpSass({ outputStyle: "compressed" }).on("error", gulpSass.logError),
    )
    .pipe(gulp.dest("./src/public/"));
}

exports.sass = sass;

function setupBrowserSync() {
  browserSync.init({
    proxy: "localhost:9000",
    port: 3000,
    files: ["src/public/**/*.*"],
  });
}

function startNodemon() {
  return nodemon({
    script: "src/index.js",
    watch: ["src/**/*.js", "*.js"],
    ignore: [
      "node_modules/",
      "data/",
      "src/public/",
      "gulpfile.js",
      "package*.json",
    ],
    ext: "js",
    env: { NODE_ENV: "development" },
  }).on("start", () => {
    browserSync.reload();
  });
}

function serve() {
  setupBrowserSync();
  return startNodemon();
}

exports.start = gulp.series(generateDevtoolsWorkspaceConfig, sass, serve);
