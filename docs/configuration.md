# Configuration

## CLI

### Usage 

```bash
light-webhook -c ./configuration.yaml
```


| option    | description                       |
|-----------|-----------------------------------|
| --config  | Path to `YAML` configuration file |
| --help    | Help!                             |


## Configuration file

Below you can see full **configuration structure** with some default value. Only lines marks with `# required` are always required.  
Then read each node specific documentation more information.

```yaml
name: simple-stream         # required - stream name identifier
interval: 1000              # optional - source loop interval for more or less reactivity
stream:                     # required - stream array which contains all nodes composing stream 
    -   name: node-1        # unique node name for all stream
        type: node-type     # specific node type (source for input node / sink for processing node )
        settings:           # specific node settings
            # custom node settings....
        out:                # publish record to (many) named node(s)
            - node-2

    -   name: node-2
        type: node-type
        settings:
            # custom node settings....
        out:
            - node-3

    -   name: node-3        
        type: node-type
        settings:
            # custom node settings....
    
    # chains all your nodes
```
## Templating

> DISABLED FOR MOMENT. WORKING IN PROGRESS

You can templatize any configuration value with the receive `Tuple` from previous Node.

Tuple is composed with this following object:
- `id` : Unique id generated when the first tuple in the Input node is created.
- `headers`: Headers send/received from previous **nodes** (can be overrides during pipeline)
- `data`: Data object (JSON/key:value) from the previous **node** (it is always overrides by the previous node)
- `files`: Dictionary (field:object) for each files received in the first Input node.
- `file`: When node working on each file (e.i: S3 node), current file is available.

> Templating sur powered by [SquirrellyJS](https://squirrelly.js.org/) a _Powerful, lightweight, pluggable JS template engine_.

### Examples

```shell script
# id
"{{id}}" => '1449302420492' (Timestamp)

# headers
"{{headers['content-type']}}"  => 'application/json'

# data
"URL: {{data.issue.url}}"      => 'URL: https://api.github.com/repos/octocat/Hello-World/issues/1347'
"{{stringify(options.data)/}}  => '{"issue": { "url": "https://api.github.com/repos/octocat/Hello-World/issues/1347"}}'

# files
"{{files['my_field'].path}}"     => '/tmp/my_file.txt'
"{{files['my_field'].filename}}" => 'my_file.txt'
"{{files['my_field'].size}}"     => '1024'


# file
"{{file.path}}"     => '/tmp/my_file.txt'
"{{file.filename}}" => 'my_file.txt'
"{{file.size}}"     => '1024'

```

