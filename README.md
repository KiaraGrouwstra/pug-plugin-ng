# pug-plugin-ng
A Pug plugin allowing unquoted use of Angular 2's `[(bananabox)]="val"` syntax.
It does this by patching `pug-lexer`'s `attrs` function to allow use of Angular 2 `[property]` / `(event)` bindings without additional commas/quotes.
While you're at it, you may also want to set the `doctype` to `html` in Pug's options to allows attributes with implicit values (e.g. Angular 1/2 directives not taking parameters as commonly used in Material2/Ionic2, as well as ``#template_variables`).

## Installation

```
# WIP
# The following won't work
npm install pug-plugin-ng
```

## Usage:

### With webpack:

Note that this won't actually work, since webpack kills functions in its loader options with JSON serialization. :(

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
