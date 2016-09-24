# pug-plugin-ng
A Pug plugin allowing unquoted use of Angular 2's `[(bananabox)]="val"` syntax.

## What it does:

Allow you to go from this:
```
<button id="foo" class="bar" #myVar md-raised-button [disabled]="isDisabled" (click)="boom">text</button>
```

Or these:
```
button#foo.bar(#myVar='' md-raised-button='' '[disabled]'="isDisabled" '(click)'="boom") text
button#foo.bar(#myVar='', md-raised-button='', [disabled]="isDisabled", (click)="boom") text
```

To this:
```
button#foo.bar(#myVar md-raised-button [disabled]="isDisabled" (click)="boom") text
```

The idea: allow your Pug to get terser and closer to the HTML, allowing you to use HTML snippets found online in Pug with less effort.

## How it works:
It does this by patching `pug-lexer`'s `attrs` function to allow use of Angular 2 `[property]` / `(event)` bindings without additional commas/quotes.
While you're at it, you may also want to set the `doctype` to `html` in Pug's options to allows attributes with implicit values (e.g. Angular 1/2 directives not taking parameters as commonly used in Material2/Ionic2, as well as ``#template_variables`).

## Installation

```
npm install pug-plugin-ng@github:tycho01/pug-plugin-ng
// future, not available yet:
npm install pug-plugin-ng
```

## Usage:

### With webpack:

`myComp.pug`:
```
.items(
  *ngFor="#item of items"
  [ngClass]="{'active': isActive}"
)
  p {{item}}
```

`myComp.ts`:
```
@Component({
  template: require('./myComp.pug'),
})
```

In your `webpack.config.js` file, using `pug-html-loader`:
```
let pug_plugin_ng = require('pug-plugin-ng');
let pug_opts = { doctype: 'html', plugins: [pug_plugin_ng] };
module.exports = {
  // your config settings ...
  module: [
    //your modules...
    loaders: [
      {
				test: /\.pug$/,
        loader: 'pug-html',
        query: pug_opts,
			},
    ]
  ]
};
```

### with Gulp (e.g. for Ionic):
```
let pug = require('gulp-pug');
let pug_plugin_ng = require('pug-plugin-ng');
let pug_opts = { doctype: 'html', plugins: [pug_plugin_ng], pretty: true };
gulp.task('pug', () =>
  gulp.src('app/**/*.pug')
  .pipe(pug(pug_opts))
  .pipe(gulp.dest('www/build'))
);

// add pug task to your build/watch tasks, incl. a watch function like this:
gulpWatch('src/**/*.pug', () => gulp.start('pug'));
```

### Alternative: inline
This doesn't require webpack, but you want to use something like that instead. Or JSPM maybe.
```
let pug_plugin_ng = require('pug-plugin-ng');
let pug = require('pug');
let pug_opts = { doctype: 'html', plugins: [pug_plugin_ng] };
@Component({
  template: pug.render('p([(banana)]="box" #my_var directive) hi', pug_opts),
})
```
