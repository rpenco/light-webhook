# Gitlab

> NOT IMPLEMENTED YET!  
> This page is an implementation proposal.


## Usage

```yaml
type: gitlab-source
settings:
  events:
   - push
   - merge_request
  method: post
  token: sha1=<secret-token>
```
### Settings

| Settings        | Default  | Description                                                               |
|-----------------|----------|---------------------------------------------------------------------------|
| method          | `post`   | Acceptable HTTP method                                                    |
| events          | `['*']`  | Acceptable Gitlab events. Use `['*']` to allow all events                 |
| token       |          | Secret provided by `X-Gitlab-Token` header. Or missing to disabled it.   |
| headers.xGitlabEvent     | `x-gitlab-event`  | Key of the received header which contains events        |
| headers.xGitlabToken | `x-gitlab-token`  | Key of the received header which contains token     |


## Record


This node publishes record with this additional fields:

```json
{
  // Gitlab request body
}
```