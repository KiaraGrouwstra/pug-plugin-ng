# pug-plugin-ng
A Pug plugin allowing unquoted use of Angular 2's `[(bananabox)]="val"` syntax

## Installation

```
# WIP
# The following won't work
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
module.exports = {
  // your config settings ...
  module: [
    //your modules...
    loaders: [
      {
				test: /\.pug$/,
        loader: 'pug-html',
        query: { plugins: [pug_plugin_ng] },
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
@Component({
  template: pug.render('p([(banana)]="box") hi', { plugins: [pug_plugin_ng] }),
})
```
