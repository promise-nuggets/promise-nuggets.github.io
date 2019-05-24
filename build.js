#!/usr/bin/env node

var Metalsmith  = require('metalsmith');

var collections = require('metalsmith-collections');
var wjade       = require('metalsmith-pug')
var layouts     = require('metalsmith-layouts');
var markdown    = require('metalsmith-markdown');
var permalinks  = require('metalsmith-permalinks');
var less        = require('metalsmith-less')


Metalsmith(__dirname)         // __dirname defined by node.js:
                              // name of current working directory
  .metadata({                 // add any variable you want
                              // use them in layout-files
    sitename: "My Static Site & Blog",
    siteurl: "http://example.com/",
    description: "It's about saying »Hello« to the world.",
    generatorname: "Metalsmith",
    generatorurl: "http://metalsmith.io/"
  })
  .source('./src/site') // source directory
  .destination('./build')     // destination directory
  .clean(true)                // clean destination before
  .use(collections({          // group all blog posts by internally
    posts: '*.md',
    index: '*.html.jade'             // adding key 'collections':'posts'
  }))                         // use `collections.posts` in layouts
  .use(markdown())            // transpile all md into html
  .use(wjade({ useMetadata: true }))
  .use(less())
  .use(layouts({
    directory: 'src/layouts'
  }))             // wrap layouts around html
  .build(function(err) {      // build process
    if (err) {
      console.log(err);
      console.log(err.file)
    }
  });