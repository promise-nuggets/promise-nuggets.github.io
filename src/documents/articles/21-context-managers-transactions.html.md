
---
title: Context managers and transactions
layout: nuggets
category: Advanced examples
level: 2
date: 2007-01-05
---

Context managers are a useful tool. They automatically dispose of resources
when the operation within the context completes or an error happens in that
context.

Lets agree that all our disposable resources have a `.dispose()` method. How
would we write a context manager?

#### Callbacks

Domains in node.js allow you to do this, in a way:

```js
function using(resource, fn, done) {

  var d = domain.create();
  function closeAndDone(err, res) {
    d.dispose();
    resource.dispose(function() {
      done(err, res);
    });
  }
  d.once('error', closeAndDone);
  d.run(function() { 
    fn(resource, closeAndDone); 
  });
}
```

Using the context manager is simple. But we need to remember to forward the
done callback and not use the original callback.

```js
function connectAndFetchSomething(args, done) {
  using(client.connect(host), function(conn, done) {
    var stuff = JSON.parse(something);
    return conn.doThings(stuff, function(err, res) {
      if (err) done(err);
      conn.doOherThingWith(JSON.parse(res), done);
  }, done);
});
```



#### Promises

Using promises, we can write our own context manager without using domains:

```js
function using(resource, fn) {
  // wraps it in case the resource was not promise
  var pResource = Promise.cast(resource); 
  return pResource.then(fn).finally(function() { 
    return pResource.then(function(resource) { 
      return resource.dispose(); 
    }); 
  });
}
```

Using it is fairly straightforward

```js
function connectAndFetchSomething(...) {
  return using(client.connect(host), function(conn) {
    var stuff = JSON.parse(something);
    return conn.doThings(stuff).then(function(res) { 
      return conn.doOherThingWith(JSON.parse(res)); 
    ));
  }); 
});
```

The resources will always be disposed of after the promise chain returned 
within `using`'s `fn` argument completes. Even if an error was thrown within 
that function (e.g. from JSON.parse) or its inner `.then` closures (like the 
second JSON.parse), or if a promise in the chain was rejected (equivalent to 
callbacks calling with an error).

The same technique can be used for database transactions:

```js
function beginTransaction(fn) {
  var tx = db.begin();
  return tx.then(fn).then(function(res) { 
    return tx.commit().then(function() {
      return res;
    });
  }, function(err) {
    tx.rollback();
    throw err;
  });
}
```

Now you don't need to manually commit/rollback transactions anymore - it will
happen automatically depending on whether an error happens or not in the 
returned promise chain. Woah.

```js
function doQueries() {
  return beginTransaction(function(tx) {
    return tx.query(...).then(function() {
      return tx.otherQuery(...);
    }).then(function() {
      // this will be the value of the resulting promise.
      return tx.resultQuery(...); 
    })
  });
}
```

## Notes

The method `.finally()` allows you to schedule another operation to be executed 
without modifying the result or error from the original promise. It works 
similarly to the sync `finally` in `try / catch / finally`

The context manager idea can be extended further to allow us to add extra 
resources which will be automatically disposed. The API could look like this:

```js
using(client.connect(host1), 
      client.connect(host2), function(conn1, conn2) {
        return pipeStreams(conn1.resultReader(query), 
                           conn2.resultWriter());
}).done(function(res){
  // all resources are disposed of
}, function(err) {
  // all resources are disposed of
})
```

Or perhaps if we want to be able to add resources dynamically:

```js
using(function(autodispose) {
  var conn1 = autodispose(client.connect(host1)),
      conn2 = autodispose(client.connect(host2));
  return Promise.all(conn1, conn2).then(function() {
    return pipeStreams(conn1.resultReader(query), 
                       conn2.resultWriter());
  })
}).done(function(res){
  // all resources are disposed of
}, function(err) {
  // all resources are disposed of
})
```

The possibilities are... endless!
