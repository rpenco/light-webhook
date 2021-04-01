# Github source

> NOT IMPLEMENTED YET!  
> This page is an implementation proposal.


## Usage

```yaml
type: github-source
settings:
  events:
    - push
    - merge_request
  method: post
  signature: sha1=<secret-signature>
  headers:
    xGithubEvent: <key>
    xGithubSignature: <key>
```

### Settings

| Settings        | Default  | Description                                                               |
|-----------------|----------|---------------------------------------------------------------------------|
| method          | `post`   | Acceptable HTTP method                                                    |
| events          | `['*']`  | Acceptable Github events. Use `['*']` to allow all events                 |
| signature       |          | Secret provided by `X-Hub-Signature` header. Or missing to disabled it.   |
| headers.xGithubEvent     | `x-github-event`  | Key of the received header which contains events        |
| headers.xGithubSignature | `x-hub-signature` | Key of the received header which contains signature     |


## Record

This node publishes record with this additional fields:

```json
{
  // Github request body
}
```