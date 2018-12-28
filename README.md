## Scaffolded

### Installation
```bash
npm install --save scaffolded
```

## Usage

Scaffolded will look for a folder `/templates` and 

```js
const scaffold = require('scaffolded')
scaffold([
  {
    name: 'favorateColor',
    message: 'whats your favorate color?',
    default: 'Yellow'
  }
])
```
