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

It does this by patching `pug-lexer`'s `attrs` function to allow use of Angular 2 `[property]` / `(event)` bindings without [additional commas/quotes](https://pugjs.org/language/attributes.html#quoted-attributes).

While you're at it, you may also want to set the `doctype` to `html` in Pug's options to allow [attributes with implicit values](https://pugjs.org/language/attributes.html#boolean-attributes) (e.g. Angular 1/2 directives not taking parameters as commonly used in Material2/Ionic2, as well as `#template_variables`). Otherwise, `#myVar` would need to become `#myVar=''`; similarly directives like `md-raised-button` would need to become `md-raised-button=''`.

## Installation

```
npm i --saveDev pug-plugin-ng
```

## Why does this exist?

Pug is great. However, online you will primarily find HTML snippets. This allows you to write element attributes in Pug as you would in HTML (without additional quotes/commas/`=''`), which can save some pain especially using Angular 2 with its directives, template variables and attribute names containing punctuation like `*ngIf="true"`, `#my_var`, `[prop]="val"` or `(event)="boom()"`.
If you've ever wanted to copy HTML snippets and use them in Pug with little effort (without say [html2pug](http://html2pug.com/)), or just wanted even terser template syntax, this will help.

## Sounds useful. Why isn't this the default setting in Pug?

Backward compatibility. So Pug allows using JS in attribute values, and in JS an expression doesn't by definition end after a space. Technically, in `[foo]="val" [bar]="baz"`, JS might interpret the `[foo]="val" [bar]` part as `[foo]="val"[bar]`, which might yield as a value for `[foo]` the character part of string `"val"` at index `bar` (though it'll then error with `Assigning to rvalue` because of the following `="baz"`).

To maintain consistency, Pug by default [follows JS semantics](https://github.com/pugjs/pug-lexer/pull/69#issuecomment-239973538) here. So in case you do intend to use `[foo]="val" [bar]` (note the space before the `[`) as an index selector rather than as Angular 2 bindings, this will break your code.

## Can I still use the awkward escaped syntax too?

Yep, no existing syntax has been harmed.

## Usage:

### With webpack + `pug-html-loader` [`^1.0.10`](https://github.com/tycho01/pug-plugin-ng/pull/3):

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

In your `webpack.config.js` file:
```
module.exports = {
  // your config settings ...
  module: [
    //your modules...
    loaders: [
      {
        test: /\.pug/,
        loader: 'pug-html', 
        query: { doctype: 'html', plugins: ['pug-plugin-ng'] },
      },
    ]
  ]
};
```

If you have multiple loaders chained it can be written like this.

```
      {
        test: /\.pug/,
        include: helpers.root('modules'),
        loaders: [
          { loader: 'html', query: { root: 'images' } },
          { loader: 'pug-html', query: { doctype: 'html', plugins: ['pug-plugin-ng'] }},
        ]
      },
```

Note that for Webpack 1 this requires using [`pug-ng-html-loader`](https://github.com/tycho01/pug-ng-html-loader) instead of [`pug-html-loader`](https://github.com/willyelm/pug-html-loader). The reason for this is that having to pass in a plugin (patching function) to Pug cannot be done through Webpack, as its JSON serialization strips out any functions, see [here](https://github.com/pugjs/pug-lexer/pull/69#issuecomment-241119765).

Webpack 1, using `pug-ng-html-loader`:
```
      { test: /\.pug$/, loader: 'pug-ng-html' },
```

### with Rollup:

Use [rollup-plugin-pug](https://github.com/aMarCruz/rollup-plugin-pug) or [rollup-plugin-pug-html](https://github.com/tycho01/rollup-plugin-pug-html/) and pass `plugins: [require('pug-plugin-ng')]` as part of the Pug options.

### with Gulp (e.g. for Ionic):
```
let pug = require('gulp-pug');
let pug_plugin_ng = require('pug-plugin-ng');
let pug_opts = { doctype: 'html', plugins: [pug_plugin_ng] };
gulp.task('pug', () =>
  gulp.src('app/**/*.pug')
  .pipe(pug(pug_opts))
  .pipe(gulp.dest('www/build'))
);

// add pug task to your build/watch tasks, incl. a watch function like this:
gulpWatch('src/**/*.pug', () => gulp.start('pug'));
```

See also [this thread](https://github.com/driftyco/ionic-app-scripts/issues/31) on Ionic 2's introduction of `ionic-app-scripts` since RC, which complicates things.

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

## License

MIT (http://www.opensource.org/licenses/mit-license.php)
