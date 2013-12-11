---
title: Complex task dependencies
layout: nuggets
category: Multiple operations
date: 2007-01-05
---

Sometimes our task dependencies are complex enough that we might need to
run some things in parallel and other things in series.

Lets say we have a versioned file and we want to get a diff of the latest two 
versions. To do this, we need to get the IDs of the latest two versions, then 
get their content, then compare the content of the first with the other and
finally do something with the result.

#### Callbacks

With callbacks we would combine `async.waterfall` and `async.parallel`

```js
async.waterfall([
	files.getLastTwoVersions.bind(files),
	function(items, callback) {
		async.parallel([
			versions.get.bind(versions, item.last),
			versions.get.bind(versions, item.previous)],
			callback)
	}, 
	function(v, callback) {
		diffService.compare(v[0].blob, v[1].blob, callback)
	}], 
	function(err, diff) {
		// voila, diff is ready. Do something with it.
	})
```

#### Promises

With promises we can simply return an array, then use `Promise.spread` 
available in both bluebird and Q. It works on promises for arrays and resolves
all the items in the array then passes them to the callback:

```js
files.getLastTwoVersions(filename)
    .then(function(items) {
        return [versions.get(items.last), 
        	    versions.get(items.previous)];
    })
    .spread(function(v1, v2) { 
        return diffService.compare(v1.blob, v2.blob)
    })
    .then(function(diff) {
        // voila, diff is ready. Do something with it.
    });
```

## Notes

TODO.