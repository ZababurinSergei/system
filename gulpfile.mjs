import gulp from 'gulp'
import postcss from 'gulp-postcss'
import {pxtoviewport} from './this/index.mjs'
import autoprefixer from 'autoprefixer'
import * as dotenv from 'dotenv'
import rename from "gulp-rename";

dotenv.config()

//1920
//375
let dir = './services/osc/src/tests'
let rootWidthDesktop = 2080
let rootHeightDesktop = 1080
const rootWidthMobile = 375
let viewportHeigth = 800
let media = 'none'

let src, i = process.argv.indexOf("--src");
let width, j = process.argv.indexOf("--rootWidthDesktop");
let k = process.argv.indexOf("--media");
let h = process.argv.indexOf("--viewportHeigth");
let d = process.argv.indexOf("--dir");

if(d >- 1) {
    dir = process.argv[d+1];
}


if(k >- 1) {
    viewportHeigth = process.argv[h+1];
}

if(k >- 1) {
    media = process.argv[k+1];
}

if(i>-1) {
    dir = process.argv[i+1];
}

if(j>-1) {
    rootWidthDesktop = process.argv[j+1];
}


console.log('path: ', dir, "rootWidthDesktop: ", rootWidthDesktop)
gulp.task('px2min', function () {
    // console.time("⚡ [gulp] Done");

    let processors = [
        pxtoviewport({
            unitToConvert: 'px',
            isMin: true,
            propList: ['*'],
            unitPrecision: 2,
            viewportHeigth: viewportHeigth,
            viewportWidth: rootWidthDesktop,
            viewportUnit: 'vw',
            fontViewportUnit: 'vw',
            selectorBlackList: [],
            minPixelValue: 0.1,
            mediaQuery: true,
            replace: true,
            exclude: [/(\/|\\)node_modules(\/|\\)/],
            landscape: false,
            landscapeUnit: 'vw',
            landscapeWidth: rootWidthMobile
        })
    ];

    let result = gulp.src([`${dir}/**/*.${media}.css`])
        .pipe(postcss(processors))
        .pipe(postcss([ autoprefixer()]))
        .pipe(gulp.dest(`${dir}`));
    // .pipe(rename(`result.css`))
    return result
});

gulp.task('min2px', function () {
    // console.time("⚡ [gulp] Done");

    let processors = [
        pxtoviewport({
            unitToConvert: 'vw',
            isMin: true,
            propList: ['*'],
            unitPrecision: 0,
            viewportHeigth: 10000/viewportHeigth,
            viewportWidth: 10000/rootWidthDesktop,
            viewportUnit: 'px',
            fontViewportUnit: 'px',
            selectorBlackList: [],
            minPixelValue: 0.001,
            mediaQuery: true,
            replace: true,
            exclude: [/(\/|\\)node_modules(\/|\\)/],
            landscape: false,
            landscapeUnit: 'px',
            landscapeWidth: rootWidthMobile
        })
    ];

    // let result = gulp.src([`${dir}/index.module.css`], { sourcemaps: true })
    return gulp.src([`${dir}/**/*.${media}.css`])
        .pipe(postcss(processors))
        .pipe(postcss([autoprefixer()]))
        .pipe(gulp.dest(`${dir}`));
});


gulp.task('px2vw', function () {
    // console.time("⚡ [gulp] Done");

    let processors = [
        pxtoviewport({
            unitToConvert: 'px',
            isMin: false,
            propList: ['*'],
            unitPrecision: 2,
            viewportHeigth: viewportHeigth,
            viewportWidth: rootWidthDesktop,
            viewportUnit: 'vw',
            fontViewportUnit: 'vw',
            selectorBlackList: [],
            minPixelValue: 0.1,
            mediaQuery: true,
            replace: true,
            exclude: [/(\/|\\)node_modules(\/|\\)/],
            landscape: false,
            landscapeUnit: 'vw',
            landscapeWidth: rootWidthMobile
        })
    ];

    let result = gulp.src([`${dir}/**/*.${media}.css`])
        .pipe(postcss(processors))
        .pipe(postcss([ autoprefixer()]))
        .pipe(gulp.dest(`${dir}`));

    return result
});

gulp.task('vw2px', function () {
    // console.time("⚡ [gulp] Done");

    let processors = [
        pxtoviewport({
            unitToConvert: 'vw',
            isMin: false,
            propList: ['*'],
            unitPrecision: 0,
            viewportHeigth: 10000/viewportHeigth,
            viewportWidth: 10000/rootWidthDesktop,
            viewportUnit: 'px',
            fontViewportUnit: 'px',
            selectorBlackList: [],
            minPixelValue: 0.001,
            mediaQuery: true,
            replace: true,
            exclude: [/(\/|\\)node_modules(\/|\\)/],
            landscape: false,
            landscapeUnit: 'px',
            landscapeWidth: rootWidthMobile
        })
    ];

    // let result = gulp.src([`${dir}/index.module.css`], { sourcemaps: true })
    console.log('sssssssssssssssssssssssss',[`${dir}/**/*.${media}.css`])
    let result = gulp.src([`${dir}/**/*.${media}.css`])
        .pipe(postcss(processors))
        .pipe(postcss([ autoprefixer()]))
        .pipe(gulp.dest(`${dir}`));
    // .pipe(rename(`result.css`))
    // console.timeEnd("⚡ [gulp] Done");

    return result
});

gulp.task('px2vh', function () {
    // console.time("⚡ [gulp] Done");

    let processors = [
        pxtoviewport({
            unitToConvert: 'px',
            propList: ['*'],
            unitPrecision: 2,
            viewportWidth: rootWidthDesktop,
            viewportUnit: 'vh',
            fontViewportUnit: 'vh',
            selectorBlackList: [],
            minPixelValue: 0.1,
            mediaQuery: true,
            replace: true,
            exclude: [/(\/|\\)node_modules(\/|\\)/],
            landscape: false,
            landscapeUnit: 'vw',
            landscapeWidth: rootWidthMobile
        })
    ];


    let result = gulp.src([`${dir}/**/*.${media}.css`])
        .pipe(postcss(processors))
        .pipe(postcss([ autoprefixer()]))
        .pipe(gulp.dest(`${dir}`));

    // console.timeEnd("⚡ [gulp] Done");

    return result
});



gulp.task('vh2px', function () {
    // console.time("⚡ [gulp] Done");

    let processors = [
        pxtoviewport({
            unitToConvert: 'vh',
            propList: ['*'],
            unitPrecision: 0,
            viewportWidth: 10000/rootWidthDesktop,
            viewportUnit: 'px',
            fontViewportUnit: 'px',
            selectorBlackList: [],
            minPixelValue: 0.001,
            mediaQuery: true,
            replace: true,
            exclude: [/(\/|\\)node_modules(\/|\\)/],
            landscape: false,
            landscapeUnit: 'vh',
            landscapeWidth: rootWidthMobile
        })
    ];

    let out = gulp.src([`${dir}/**/*.${media}.css`], { sourcemaps: true })
        .pipe(postcss(processors))
        .pipe(postcss([ autoprefixer()]))
        .pipe(gulp.dest(`${dir}`), { sourcemaps: true });

    // console.timeEnd("⚡ [gulp] Done");

    return out
});



gulp.task('px2rem', function () {
    // console.time("⚡ [gulp] Done");

    let processors = [
        pxtoviewport({
            unitToConvert: 'px',
            propList: ['*'],
            unitPrecision: 2,
            viewportWidth: rootWidthDesktop,
            viewportUnit: 'rem',
            fontViewportUnit: 'rem',
            selectorBlackList: [],
            minPixelValue: 0.1,
            mediaQuery: true,
            replace: true,
            exclude: [/(\/|\\)node_modules(\/|\\)/],
            landscape: false,
            landscapeUnit: 'vw',
            landscapeWidth: rootWidthMobile
        })
    ];


    let result = gulp.src([`${dir}/**/*.${media}.css`])
        .pipe(postcss(processors))
        .pipe(postcss([ autoprefixer()]))
        .pipe(gulp.dest(`${dir}`));

    // console.timeEnd("⚡ [gulp] Done");

    return result
});



gulp.task('rem2px', function () {
    // console.time("⚡ [gulp] Done");

    let processors = [
        pxtoviewport({
            unitToConvert: 'rem',
            propList: ['*'],
            unitPrecision: 0,
            viewportWidth: 10000/rootWidthDesktop,
            viewportUnit: 'px',
            fontViewportUnit: 'px',
            selectorBlackList: [],
            minPixelValue: 0.001,
            mediaQuery: true,
            replace: true,
            exclude: [/(\/|\\)node_modules(\/|\\)/],
            landscape: false,
            landscapeUnit: 'rem',
            landscapeWidth: rootWidthMobile
        })
    ];

    let out = gulp.src([`${dir}/**/*.${media}.css`], { sourcemaps: true })
        .pipe(postcss(processors))
        .pipe(postcss([ autoprefixer()]))
        .pipe(gulp.dest(`${dir}`), { sourcemaps: true });

    // console.timeEnd("⚡ [gulp] Done");

    return out
});