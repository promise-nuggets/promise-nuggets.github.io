---
title: The simplest example
layout: nuggets.html.pug
category: Introduction
date: 2007-01-05
---

Whats the main difference between callback-based functions and promise-based
functions?

The first call the callback with the error and the result:

```js
fs.readFile(path, function(error, content) {
	// handle error or do something with content
})
```

The second return promises. We can attach two callbacks - one for the value,
another to handle the error:

```js
fs.readFileAsync(path).done(function(content) {
	// do something with content
}, function(error) {
	// handle error
})
```

## Notes

Whats going on here?

`fs.readFileAsync(file)` starts a file reading operation.
That operation is not yet complete at the point when readFile returns. This
means we can't return the file content.

But we can still return something: we can return the reading operation itself.
And that operation is represented by a promise.

It's is sort of like a single-value stream:

```js
net.connect(port).on('data', function(res) {
	doStuffWith(res);
}).on('error', function(err) {
	handleError();
});
```

But there are also some important differences which are going to be covered
later on.
