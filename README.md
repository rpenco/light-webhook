# webhook-client

Simple webhook client.  
Receives requests from Github, Gitlab, or HTTP and executes HTTP request or Bash command.

**Implementation in progress !**

[![Build Status](https://travis-ci.org/rpenco/light-webhook.svg?branch=master)](https://travis-ci.org/rpenco/light-webhook)
[![npm version](https://badge.fury.io/js/light-webhook.svg)](https://badge.fury.io/js/light-webhook)

## Usage

```bash
npm i -g light-webhook

light-webhook --config=./config.json --port=8080
```

Create a configuration file `config.json`.

```json
[
  {
    "webclient1": {
      "subscribe": [
        {
          "service": "github",
          "name": "mygithub",
          "description": "On a github event"
        }
      ],
      "publish": [
        {
          "service": "bash",
          "description": "Execute my local script",
          "settings": {
            "cmd": [ "/home/me/myscript.sh"]
          }
        }
      ]
    }
  }
]
```

And configure a github webhook to point to `http://example.com:8080/webclient1/mygithub`

## Configuration

### Generic structure

```json5
[
    {
      "unique-name": { // an unique name for each webhook
                           
       subscribe: [   // hook providers
           {
             "service": "", // service to use
             "name": "", // choose an unique name
             "description": "", // optional comment with a description
             "settings": {}, // specific service settings
           }
       ],
       publish: [ // actions to execute
         {
           "service": "", // service to use
           "name": "", // choose an unique name
           "description": "", // optional comment with a description
           "settings": {}, // specific service settings
         }
       ]
     }
    }
]
```


## Subscriptions

Available services:

### Github

```json
{
  "service": "github",
  "name": "my-github",
  "description": "On Github event",
  "settings":{
    "events": ["*"], //["*"] all or ["push", "merge_request", ...]
    "secret": "helloworld" // secret or false
  }
}
```

### Gitlab

```json
{
  "service": "gitlab",
  "name": "my-gitlab",
  "description": "On Gitlab event",
  "settings":{
    "events": ["*"], //["*"] all or ["push", "tag_push", "merge_request", ...]
  }
}
```

### Custom HTTP POST

```json
 {
    "service": "http",
    "name": "my-custom-hook",
    "description": "On custom HTTP POST",
    "settings":{
     "events": ["my-event"], //["*"] all or ["my-event", "my-event2", ...]
      "secret": "hello" // secret sha1 or false
    }
}
```

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

## Publications


### Bash 

You can call a local bash command 

```json
{
  "service": "bash",
  "name": "pull-repo",
  "description": "Call my repo",
  "settings":{
    "cmd": ["echo", "{{headers.x-github-event}}"]
  }
}
```

or call a bash script

```json
{
  "service": "bash",
  "name": "pull-repo-script",
  "description": "Call my repo",
  "settings":{
    "cmd": ["/home/me/{{headers.x-github-event}}-my-repo.sh"]
  }
}
```

### Custom HTTP 

You can create a other webhook.
```json
{
  "service": "http",
  "name": "myotherhttp",
  "description": "Emit an other webhook",
  "settings":{
    "method": "GET",
    "url": "http://myotherservice.com",
    "params": {"key": "value"},
    "body": "In case of POST/PUT",
    "headers": {"user-agent": "Mozilla/5.0 xx"}
  }
}
```

