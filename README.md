# webhook-client

Simple webhook client. **Implementation in progress !**


## Example


Create a configuration file.

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
          "description": "Update my local repo",
          "settings": {
            "cmd": [ "git", "pull"]
          }
        }
      ]
    }
  }
]
```

And configure a github webhook to point to `http://example.com/webclient1/mygithub`

## Subscriptions

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

