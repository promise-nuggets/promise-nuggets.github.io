---
title: Creating new functions
layout: nuggets.html.pug
category: Introduction
date: 2007-01-05
---

Creating simple functions is easy.

#### Callbacks

To create a callback-taking function, add a callback argument to your function.
Then you can pass the callback to another callback-taking function.

```js
function readMyFile(callback) {
	fs.readFile('myfile.txt', callback);
}
```

#### Promises

To create a promise-based function, simply return the promise as a result.

```js
function readMyFile() {
	return fs.readFileAsync('myfile.txt');
}
```

But what if you want to do additional processing? Then you'll also need to
[create your own callback, or use the power of `.then()`](03-power-of-then-sync-processing.html).