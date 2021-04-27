# Gitlab source

> 🟡 PARTIAL IMPLEMENTATION    
> This source has a partial implementation.   

## Description

Receive a Http Gitlab request with custom webhook headers to perform any action.

## Usage

```yaml
type: http-source
settings:
    host: 127.0.0.1
    port: 8080
    method: post
    path: /gitlab
    webhook:
      events:
       - push
       - merge_request
      signature: sha1=<secret-signature>
      headers:
        event: 'x-gitlab-event'
        token: 'x-gitlab-signature'
```
### Settings

Configure a classic [Http Source](source/http.md) with specific headers `x-gitlab-event` and `x-gitlab-signature`.   
Read [Http Source](source/http.md) documentation page for more information.

## Record

This node publishes record with this additional fields:

```json
{
  // Gitlab request body
}
```