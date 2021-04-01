# light-webhook

[![Build Status](https://travis-ci.org/rpenco/light-webhook.svg?branch=master)](https://travis-ci.org/rpenco/light-webhook)
[![npm version](https://badge.fury.io/js/light-webhook.svg)](https://badge.fury.io/js/light-webhook)
[![NPM](https://img.shields.io/npm/dt/light-webhook.svg)](https://npmjs.org/package/light-webhook)
[![Package Quality](https://npm.packagequality.com/shield/light-webhook.png)](https://packagequality.com/#?package=light-webhook)

> THIS VERSION IS UNDER DEVELOPMENT.  
> Use [this version (1.0.6)](https://github.com/rpenco/light-webhook/tree/master) or help me contributing. 

## Overview

Receive requests from **Github**, **Gitlab**, **HTTP**, **Kafka** or **Syslog** and executes **Bash** commands or send to **Kafka**, **Syslog** or **HTTP** request
You can read full and beautiful [documentation here](https://rpenco.github.io/light-webhook/)

Features

    wrench Helpers, filters
    wrench Great error reporting
    package 0 dependencies
    hammer Conditionals
    wrench Better quotes/comments support
        ex. {{someval + "name }}" }} compiles correctly, while it fails with DoT or EJS
    zap Exports ES Modules as well as UMD
    hammer Loops
    wrench Custom delimeters
    memo Easy template syntax
    wrench Precompilation
    hammer Partials
    wrench Inline JavaScript
    hammer Comments
    wrench Caching
    rocket Super Fast
        Squirrelly has been benchmarked against Marko, Pug, doT, Swig, Handlebars, Mustache, and Nunjucks. In each test, Squirrelly was fastest.
    zap Async support: async filters, helpers, partials
    wrench Template inheritance


## Licences

> MIT License