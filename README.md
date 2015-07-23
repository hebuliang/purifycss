# Infomation

This project forked from `purifycss` for supportting LESS file.

# Run

Clone this repo to your local machine for examle /Users/x/dev/, then go to your own project which you want to optimize, run:

```
cd your-project/

node /Users/x/dev/purifycss/bin/purifycss <css> <content> --option

```



# API
```javascript
var purify = require('purify-css');

purify(content, css, options, callback);
```

## ```content```
##### Type: ```Array``` or ```String```

**```Array```** of filepaths to the files you want to search through for used classes (HTML, JavaScript, Templates, anything that relates to CSS classes)

**```String```** of content you want us to look for used classes.


## ```css```
##### Type: ```Array``` or ```String```

**```Array```** of filepaths to the CSS files you want us to filter.

**```String```** of CSS you want us to filter.


##```options (optional)```
##### Type: ```Object```

##### Properties of options object:

* **```minify:```** Set to ```true``` to minify. Default: ```false```.

* **```output:```** Filepath to write purified CSS to. Returns raw string if ```false```. Default: ```false```.

* **```info:```** Logs info on how much CSS was removed if ```true```. Default: ```false```.

* **```rejected:```** Logs the CSS rules that were removed if ```true```. Default: ```false```.å

