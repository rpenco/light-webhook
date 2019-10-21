# light-webhook

Light webhook client.  
Receives requests from Github, Gitlab, or HTTP and executes HTTP request or Bash commands.

[![Build Status](https://travis-ci.org/rpenco/light-webhook.svg?branch=master)](https://travis-ci.org/rpenco/light-webhook)
[![npm version](https://badge.fury.io/js/light-webhook.svg)](https://badge.fury.io/js/light-webhook) 
[![NPM](https://img.shields.io/npm/dt/light-webhook.svg)](https://npmjs.org/package/light-webhook) 
[![Package Quality](https://npm.packagequality.com/shield/light-webhook.png)](https://packagequality.com/#?package=light-webhook) 

## Usage

```bash

npm i -g light-webhook

light-webhook -c ./config.yaml
```

| option    | description                               |
|-----------|-------------------------------------------|
| --config  | Path to configuration file (YAML or JSON) |
| --help    | Help!                                     |


Create a configuration file `config.yaml`.

```yaml
# Application port
port: 8080

# HTTPS support 
security:
  enable: false
  cert: ./cert.pem
  key: ./key.pem
  passphrase: "your passphrase"
upload_max_size: 50

# Pipelines to serve
services:
  webclient1:
    subscribe:
    - service: github
      name: my-github
      settings:
        events:
        - push
        secret: helloworld
    publish:
    - service: bash
      description: Execute my local script
      settings:
        cmd:
        - echo
        - "'event: {{headers.x-github-event}}, url: {{body.hook.url}}'"
```

And configure [a github webhook](https://developer.github.com/webhooks/creating/) to point to `http://example.com:8080/webclient1/my-github`.  

That's all, when you `push` your changes in your git repository, `light-webhook` app is triggered and execute the `echo` bash command. 

You can now execute any action (bash, HTTP request) from any HTTP event (Github, Gitlab, Custom HTTP) ! 

## Configuration

### Generic structure

The configuration has a generic pipeline structure. 

- A *client* with an unique identifier which contains 
    - a *subscribe* list of webhook listener
    - a *publish* list of action to perform 

```yaml
# List of services (pipelines)
services:
  # A service (pipeline) 
  webclient1:
    subscribe:
    - service: service
      name: my-custom-subscribe-name
      settings:
        - # custom subscribe service settings 
    publish:
    - service: service
      name: my-custom-publish-name
      settings:
        - # custom publish service settings
```

## Subscribers

### Github

```yaml
service: github
name: my-github
settings:
  events:
  - push
  - merge_request
  secret: mysecret
```

| option          | description                       |
|-----------------|-----------------------------------|
| service         | service used : `github`           |
| name            | choose an unique service name     |
| settings        | service configuration             |
| settings.events | Accepted Github events. Use `['*']` to allow all events |
| settings.secret | Secret provided by `X-Hub-Signature` header. Or `false` to disabled it. |

### Gitlab

```yaml
service: gitlab
name: my-gitlab
settings:
  events:
  - push
  - merge_request
```

| option          | description                       |
|-----------------|-----------------------------------|
| service         | service used : `gitlab`           |
| name            | choose an unique service name     |
| settings        | service configuration             |
| settings.events | Accepted Gitlab events. Use `['*']` to allow all events |

### Custom HTTP POST

```yaml
service: http
name: my-custom-hook
settings:
  events:
  - my-event
  secret: sha1-secret
```

| option          | description                       |
|-----------------|-----------------------------------|
| service         | service used : `http`             |
| name            | choose an unique service name     |
| settings        | service configuration             |
| settings.events | Accepted events. Use `['*']` to allow all events |
| settings.secret | Secret provided by `X-Webhook-Signature` header. Or `false` to disabled it.|

An header `X-Webhook-Event: my-event` must be provided to match with settings events.
if `secret` is provided, an header `X-Webhook-Signature: sha1=xxxxxxxxx` must be provided where *xxxxxxxxx* is the secret cyphered.


```bash
curl -X POST \
     -H 'Content-Type: application/json' \
     -H 'X-Webhook-Event: my-event' \ 
     -H "X-Webhook-Signature: sha1=aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d" \ 
     -d '{"repository": "myrepo", "build": 1}' \
     http://localhost:8080/myclient/my-custom-hook
```

## Publishers

### Variables

You can use **variables** from your *subscriber* body and your *publisher* settings.
 
Use `{{brackets}}` to identify a variable in your configuration. For exemple:


| option        | description                            |
|---------------|----------------------------------------|
| {{body.}}     | Variable from *subscribe body*         |
| {{headers.}}  | Variable from *subscribe headers*      |
| {{params.}}   | Variable from *subscribe query params* |


You can for example create dynamic bash command 

```yaml
service: bash
name: my-script
settings:
  cmd:
  - "./my-script.sh"
  - "{{headers.x-github-event}}"
  - "{{body.repository.url}}"
```

Will execute my custom script: `./my-script.sh push https://github.com/rpenco/light-webhook`

### Bash 

You can call a local bash command.

```yaml
service: bash
name: bash-cmd
settings:
  cmd:
  - echo
  - "'event: {{headers.x-github-event}}, body:{{body}}'"
  stringify: true
```

or call a bash script

```yaml
service: bash
name: my-script
settings:
  cmd:
  - "/home/me/my-script.sh"
```

| option        | description                       |
|---------------|-----------------------------------|
| service       | service used : `bash`             |
| name          | choose an unique service name     |
| settings      | service configuration             |
| settings.cmd  | Bash command to execute.          |
| settings.stringify | If `true`, when you use a variable, if it is an object, it will be serialized. |

### Custom HTTP request

You can create an other webhook.

```yaml
service: http
name: my-http-req
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

### File 

You can upload file to a specific location.

```yaml
service: file
name: my-upload
settings:
  path:
  - "/tmp"
```

| option        | description                       |
|---------------|-----------------------------------|
| service       | service used : `file`             |
| name          | choose an unique service name     |
| settings      | service configuration             |
| settings.path | Output directory.                 |


```shell
curl -X POST \
  http://localhost:8080/upload/my-upload \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -H 'content-type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' \
  -H 'x-webhook-event: test' \
  -F file=@/home/me/file.txt
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