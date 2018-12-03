# webhook-client

Simple webhook client. **Implementation in progress !**

## Usage

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

## Configuration

### Generic structure

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

(Soon) available services:

### Github

```json
{
  "service": "github",
  "name": "mygithub",
  "description": "On a github event"
}
```

### Gitlab

```json
{
  "service": "gitlab",
  "name": "mygitlab",
  "description": "On a gitlab event"
}
```

### Custom HTTP POST

```json
 {
    "service": "http",
    "name": "mywebhttp",
    "description": "On a custm HTTP POST"
}
```

## Publications


### Bash 

You can call a local bash command 

```json
{
  "service": "bash",
  "name": "pull-repo",
  "description": "Call my repo",
  "settings":{
    "cmd": ["cd", "/home/me/myrepo", "&&", "git", "pull"]
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
    "cmd": ["/home/me/pull-my-repo.sh"]
  }
}
```

### Custom HTTP 

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

