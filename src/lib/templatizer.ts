import * as Sqrl from 'squirrelly'

/**
 * Global References are references to the data passed into the template.
 * Example: {{someval}}
 *
 * Helper References are references that helpers create for your use.
 * Example: {{@index}}
 *
 * Helpers are for logic in the template. Loops and conditionals are both implemented as native helpers, a special kind of helper that compiles into native JS code before rendering.
 * Example: {{foreach(options.obj)}} Display something {{/foreach}}
 *
 * Filters are for processing references. Escaping and trimming are done with filters, and you can define your own that do anything from capitalizing letters to emojifying strings.
 * Example: {{someref | capitalize}}
 */

Sqrl.helpers.define('stringify', function(args, content, blocks) {
    return JSON.stringify(args)
});

export class Templatizer {

    static compile(template, options){
        return Sqrl.render(template, options)
    }
}