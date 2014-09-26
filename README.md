# grunt-redbot

**WARNING: THIS PROJECT IS NOT YET FUNCTIONAL**

Integrate [Redbot](http://redbot.org) (the HTTP protocol validation tool) into your grunt testing workflow.

Redbot validation can be manually done via the website, but the benefit of the command-line tool and grunt
integration is to fully incorporate HTTP protocol validation testing into your Dev/QA process.


## Getting Started
This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-redbot --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-redbot');
```

*This plugin was designed to work with Grunt 0.4.x. If you're still using grunt v0.3.x it's strongly recommended
that [you upgrade](http://gruntjs.com/upgrading-from-0.3-to-0.4), but in case you can't please use
[v0.3.2](https://github.com/gruntjs/grunt-contrib-clean/tree/grunt-0.3-stable).*

## Python Dependencies

  * Python 2.6+
  * [Thor](https://github.com/mnot/thor/)
  * [Redbot](https://github.com/mnot/redbot)
    
## Options

### bin

Type: `String`
Default: `redbot`

You can override the command with one of your choice. Relative paths start at the project root.

### uri

Type: `String` or `Array`

This designates the URI to be scanned. This URI must be reachable by the server running grunt.

### format

Type: `String`
Default: `txt`
Options: `txt`, `txt_verbose`, `har`, `html`

The report format in which to render the results.

* `txt` provides a clean summary for terminal output
* `txt_verbose` adds more details to guide the reader in why the failure happened and what might be done.
* `har` is a particular JSON format used by web browser request inspectors, it is useful if you want to parse
  and pass along to another part of your toolchain.
* `html` is a clean presentation of the `txt` info for browser display.

### severity

Type: `String`
Default: `noFail`
Options: `noFail`, `warning`, `bad` 

Specify the severity of Redbot report that will determine whether the grunt task is considered a failure.
A single analysis point matching the named status will be enough to fail it.

Specify `warning` will cause task failure on `warning` or `bad` results. Specifying `noFail` will instruct grunt to ignore validation failure and continue the build process.

**Until [stderr behavior for Redbot CLI](https://github.com/mnot/redbot/issues/67) is sorted out, this option
only operates when using the `har` output format. If you want clean reporting with solid failure, configure two grunt-redbot targets.**

### assets

Type: `Boolean`
Default: `false`

If the response contains HTML, setting this flag to `true` will instruct redbot to perform follow-up scans on
referenced document assets.

### print {not implemented}

Type: `Boolean`
Default: `true`

Specify whether the redbot result should be printed as it comes in. Disable if you are only interested in saved reports or pass/fail status.

### file {not implemented}

Type: `String`

Specify a file path to output the redbot result to a file.

## Usage Examples

There are three formats you can use to run this task.

### Short

This is useful when you want to scan a series of one or more URIs to manually inspect changes in the results
between runs.

```js
redbot: ["http://example.com", "http://example.org"]
```

### Medium

Specific targets for different redbot tasks with global options. This method is a straightforward progression
when you have a universal approach to redbot validation but don't test the same URLs all the time.

```js
redbot: {
  options: {
    format: "har",
  },
  cms: {
    uri: ["http://example.com", "http://example.org"]
  }
  api: {
    uri: ["http://api.example.com", "http://api.example.org"]
  }
},
```

### Long

Each target has its own global-overriding options. You can use this to test different URLs in different ways.

```js
redbot: {
  options: {
    format: "har",
  }
  cms: {
    uri: ["http://example.com", "http://example.org"],
    format: "txt_verbose",
  },
  api: {
    uri: ["http://example.com", "http://example.org"],
    severity: "warning"
  }
}
```
