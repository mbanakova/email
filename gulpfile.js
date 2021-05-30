var gulp = require("gulp");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var imagemin = require("gulp-imagemin");
var imageminJpegtran = require("imagemin-jpegtran");
var del = require("del");
var inlineCss = require("gulp-inline-css");

gulp.task("clean", function () {
	return del("build");
});

gulp.task("copy", function () {
	return gulp
		.src(["source/img/**", "source/style.css"], {
			base: "source"
		})

		.pipe(gulp.dest("build"));
});

gulp.task("inline", function () {
	return gulp
		.src("build/*.html")
		.pipe(
			inlineCss({
				applyStyleTags: true,
				applyLinkTags: true,
				removeStyleTags: true,
				removeLinkTags: true,
				preserveMediaQueries: true,
				applyTableAttributes: true
			})
		)
		.pipe(gulp.dest("build"));
});

gulp.task("css", function () {
	return gulp
		.src("source/sass/style.scss")
		.pipe(sass())
		.pipe(postcss([autoprefixer()]))
		.pipe(gulp.dest("source"))
		.pipe(server.stream());
});

gulp.task("images", function () {
	return gulp
		.src("source/img/**/*.{jpg,png}")
		.pipe(
			imagemin([
				imagemin.optipng({ optimizationLevel: 3 }),
				imageminJpegtran({ progressive: true })
			])
		)
		.pipe(gulp.dest("source/img"));
});

gulp.task("html", function () {
	return gulp.src("source/*.html").pipe(gulp.dest("build"));
});

gulp.task("server", function () {
	server.init({
		server: "build/",
		notify: false,
		open: true,
		cors: true,
		ui: false
	});

	gulp.watch("source/sass/**/*.scss", gulp.series("css"));
	gulp.watch("source/img/**", gulp.series("copy", "refresh"));
	gulp.watch("source/*.html", gulp.series("html", "inline", "refresh"));
});

gulp.task("refresh", function (done) {
	server.reload();
	done();
});

gulp.task(
	"build",
	gulp.series("clean", "images", "copy", "css", "html", "inline")
);
gulp.task("start", gulp.series("build", "server"));
