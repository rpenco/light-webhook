# HTTP Sink

> NOT IMPLEMENTED YET!  
> This page is an implementation proposal.

## Usage

Send an HTTP request to an other endpoint. **REWORK IN PROGRESS**

```yaml
type: http-sink
settings:
  method: GET
  url: http://myotherservice.com
  params:
    key: value
  headers:
    key: value

```

## Settings 

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

## Record

This node publishes record with this additional fields:

```json
{
  // Http response body
}
```