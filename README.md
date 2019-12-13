# light-webhook

> Light webhook client.  
> Receives requests from Github, Gitlab, HTTP, Kafka or Syslog and executes Bash commands or send Kafka, Syslog or HTTP request

[![Build Status](https://travis-ci.org/rpenco/light-webhook.svg?branch=master)](https://travis-ci.org/rpenco/light-webhook)
[![npm version](https://badge.fury.io/js/light-webhook.svg)](https://badge.fury.io/js/light-webhook) 
[![NPM](https://img.shields.io/npm/dt/light-webhook.svg)](https://npmjs.org/package/light-webhook) 
[![Package Quality](https://npm.packagequality.com/shield/light-webhook.png)](https://packagequality.com/#?package=light-webhook) 

## Usage

```bash

npm i -g light-webhook --no-optional

light-webhook -c ./config.yaml
```

| option    | description                                      |
|-----------|--------------------------------------------------|
| --config  | Path to configuration file (YAML, JSON or HJSON) |
| --help    | Help!                                            |


Basic configuration (`config.yaml`) example:

```yaml
# Application port
port: 8080

# Pipelines
pipelines:
  - name: github_push_pipeline
    nodes:
      - name: input_push
        type: github
        settings:
          events: ["push"]
          signature: "kdsodznvaz234rn"

      - name: execute_push
        type: bash
        settings:
          pwd: "/tmp"
          command: "echo"
          arguments:
            - "event: {{headers['x-github-event']}}, url: {{data.hook.url}}"
```

And configure [a github webhook](https://developer.github.com/webhooks/creating/) to point to `http://example.com:8080/webclient1/my-github`.  

That's all, when you `push` your changes in your git repository, `light-webhook` app is triggered and execute the `echo` bash command. 

You can now execute any action (bash, HTTP request) from any HTTP event (Github, Gitlab, Custom HTTP) ! 

## Configuration

### Generic structure

The configuration has a generic pipeline structure. 

```shell
[Input node] -> [Node 1] -> [Node 2] -> ... -> [Node N]
```
Result from `input node` his forwarded to the second node, etc...  
When the last node succeed or any node failed. First node sent a response.

```yaml
# List of pipelines
pipelines:
  # A named pipeline
  - name: my_pipeline_1
    # list of chained nodes
    nodes: 
      # A named and typed specific node
      - name: my_input_node
        type: github
        settings: {} # node configuration
      # A second named and typed specific node
      - name: my_second_node
        type: bash
        settings: {} # node configuration
```

## Input nodes

> This nodes are only available to receive events then forward to the next node.

### Github

```yaml
name: your-node-name
type: github
settings:
  events:
  - push
  - merge_request
  signature: sha1=<secret-signature>
```

| Settings        | Default  | Description                                                               |
|-----------------|----------|---------------------------------------------------------------------------|
| method          | `post`   | Acceptable HTTP method                                                    |
| events          | `['*']`  | Acceptable Github events. Use `['*']` to allow all events                 |
| signature       |          | Secret provided by `X-Hub-Signature` header. Or missing to disabled it.   |
| headers.xGithubEvent     | `x-github-event`  | Key of the received header which contains events        |
| headers.xGithubSignature | `x-hub-signature` | Key of the received header which contains signature     |

### Gitlab

```yaml
name: your-node-name
type: github
settings:
  events:
  - push
  - merge_request
token: sha1=<secret-token>
```

| Settings        | Default  | Description                                                               |
|-----------------|----------|---------------------------------------------------------------------------|
| method          | `post`   | Acceptable HTTP method                                                    |
| events          | `['*']`  | Acceptable Gitlab events. Use `['*']` to allow all events                 |
| token       |          | Secret provided by `X-Gitlab-Token` header. Or missing to disabled it.   |
| headers.xGitlabEvent     | `x-gitlab-event`  | Key of the received header which contains events        |
| headers.xGitlabToken | `x-gitlab-token`  | Key of the received header which contains token     |

### Custom HTTP

```yaml
name: your-node-name
type: http
settings:
  events: ['*']
  method: post
  signature: sha1=<secret-signature>
  headers:     
    xWebhookEvent: 'x-webhook-event'
    xWebhookSignature: 'x-webhook-signature'
  upload:     
    mkdir: true
    chmod: 'g+x'
    own: 'root:www-data'
    path: '/var/www/html'
    limit: 500
    filename: '{{file.name}}.{{file.extension}}'
```

| Settings        | Default  | Description                                                               |
|-----------------|----------|---------------------------------------------------------------------------|
| method          | `post`   | Acceptable HTTP method (`get`, `post`, `put`, `delete`)                   |
| events          | `['*']`  | Acceptable events. Use `['*']` to allow all events                        |
| signature       |          | Secret provided by `X-Webhook-Token` header. Or missing to disabled it.   |
| headers.xWebhookEvent      | `x-webhook-event`  | Key of the received header which contains events        |
| headers.xWebhookSignature  | `x-webhook-signature`  | Key of the received header which contains signature     |
| upload.mkdir    | `true`   | Create recursively directory specified in `upload.path` if not exists. |
| upload.chmod    |          | Change uploaded file rights. Allowed all syntax (e.i.: `g+x`, `755`).  | 
| upload.own      |          | Change uploaded file owner. Format: `user:group`.|
| upload.path     | `/tmp`   | Upload posted files to this directory. |
| upload.limit    | `0`      | Allowed file upload limit in **Byte** .`0` = disable upload.|
| upload.filename |          | Change uploaded filename.|

An header `X-Webhook-Event: my-event` must be provided to match with settings events.
if `signature` is provided, an header `X-Webhook-Signature: sha1=xxxxxxxxx` must be provided where *xxxxxxxxx* is the secret cyphered.

Generate a signature using [sha1-online.com](http://www.sha1-online.com/):

```bash
curl -X POST \
     -H 'Content-Type: application/json' \
     -H 'X-Webhook-Event: my-event' \ 
     -H 'x-webhook-signature: sha1=7b502c3a1f48c8609ae212cdfb639dee39673f5e' \
     -d '{"repository": "myrepo", "build": 1}' \
     http://localhost:8080/myclient/my-custom-hook
```

### File watcher (Soon)

### Kafka receiver (Soon)

### Syslog receiver (Soon)

## Nodes

> This nodes are only available to execute action after an Input node event then forward to the next node.



Will execute my custom script: `./my-script.sh push https://github.com/rpenco/light-webhook`

### Bash 

> You can call a local bash command.

```yaml
name: your-node-name
type: bash
settings:
  pwd: "/home/me"
  command: "myscript.sh"
  arguments:
    - "{{ stringify(options) /}}"
    - "{{ headers['content-type'] }}"
  environments:
    - "MY_KEY=myvalue"

```


| Settings        | Default   | Description                                                               |
|-----------------|-----------|---------------------------------------------------------------------------|
| pwd             | _current_ | Change working directory before executing command.          |
| command         |           | Bash command to execute.          |
| arguments       |           | Command arguments. |
| environments    |           | Execution environment variables. |


### S3-like (AWS/minIO)

```yaml
name: your-node-name
type: s3
settings:
    endPoint: '127.0.0.1'
    port: 9000
    useSSL: false
    accessKey: 'RD9TDM61HVMH7U11YP8P'
    secretKey: 'YlJnZtYpuAfirKeSbI8bX6zqzud1LBcTjqEniFnX'
    bucketName: 'my_bucket'
    region: 'us-east-1'
    objectName: '{{file.filename}}'
    headers: 
      'Content-Type': 'application/octet-stream'

```
> Save files to an S3 object storage.

| Settings        | Default   | Description                                                               |
|-----------------|-----------|---------------------------------------------------------------------------|
| endPoint        |           | endPoint is a host name or an IP address. |
| port            |           | TCP/IP port number | 
| useSSL          |  `false`  | If set to true, https is used instead of http. |
| accessKey       |           | accessKey is like user-id that uniquely identifies your account. |
| secretKey       |           | secretKey is the password to your account. |
| sessionToken    |           | Set this value to provide x-amz-security-token (AWS S3 specific). (Optional) |
| partSize        |           | Set this value to override default part size of 64MB for multipart uploads. (Optional) |
| bucketName      |           | Name of the bucket |
| region          |`us-east-1`| Region where the bucket is created. This parameter is optional. |
| objectName      | `{{file.filename}}` | Name of the object. |
| headers         |           | Headers use to upload file | 


### Custom HTTP request (soon)

> Send an HTTP request to an other endpoint. **REWORK IN PROGRESS**

```yaml
name: your-node-name
type: http-ouput
settings:
  method: GET
  url: http://myotherservice.com
  params:
    key: value
  headers:
    key: value

```

| option        | description                       |
|---------------|-----------------------------------|
| service       | service used : `http`             |
| name          | choose an unique service name     |
| settings      | service configuration             |
| settings.method  | HTTP method.                   |
| settings.url  | Remote url to call                |
| settings.params    | `body` request in case of `post` or `put`.|
| settings.headers   | request headers.|
| settings.stringify | If `true`, when you use a variable, if it is an object, it will be serialized. |


### Elasticsearch (soon)

> Send body to an elasticsearch cluster.

### Kafka producer (soon)

> Send body to a kafka broker.

## Templating 

You can templatize any configuration value with the receive `Tuple` from previous Node.

Tuple is composed with this following object:
 - `id` : Unique id generated when the first tuple in the Input node is created.
 - `headers`: Headers send/received from previous **nodes** (can be overrides during pipeline) 
 - `data`: Data object (JSON/key:value) from the previous **node** (it is always overrides by the previous node)
 - `files`: Dictionary (field:object) for each files received in the first Input node.
 - `file`: When node working on each file (e.i: S3 node), current file is available. 

### Examples

```shell script
# id
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

## HTTPS 

Using OpenSSL, we will generate our key and cert. So, here’s how you could do this:

```sell
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365
```

Edit configuration file and add `security` section:

```yaml
security:
  enable: true
  key: "./key.pem"
  cert: "./cert.pem"
  passphrase: YOUR PASSPHRASE HERE
```

Then start application, open your favourite browser and visit 
[https://localhost:8080](https://localhost:8080) and you should see your service running or using cURL:

```shell
curl -k https://localhost:8080
```