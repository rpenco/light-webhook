# HTTP Source

> 🟡 PARTIAL IMPLEMENTATION    
> This source has a partial implementation.   
> Each unavailable feature is indicated as __🟧 PROPOSAL__ or __❌ not available__.

## Description

Receive a Http request with custom webhook headers to perform any action.  
__🟧 PROPOSAL__ You can also upload file and use authorization and TLS support.

## Usage

```yaml
type: http-source
settings:
    host: 127.0.0.1
    port: 8080
    method: post
    path: /
    webhook:
        events: [ '*' ]
        signature: sha1=<secret-signature>
        headers:
            event: 'x-webhook-event'
            token: 'x-webhook-token'

    multipart:
        mkdir: true
        chmod: 'g+x'
        owner: 'root:www-data'
        path: '/var/www/html'
        maxSize: 1000000
        filename: '{{file.name}}.{{file.extension}}'

    tls:
        key: "./key.pem"
        cert: "./cert.pem"
        passphrase: "YOUR PASSPHRASE HERE"
```

### Settings

**Server configuration**

| Settings        | Default  | Description                                                               |
|-----------------|----------|---------------------------------------------------------------------------|
| host            | `127.0.0.1` | Server host or ip                  |
| port            | `8080`   | Server port                   |
| method          | `post`   | Acceptable HTTP method (`get`, `post`, `put`, `delete`)                   |
| path            | `/`      | HTTP path to listen                   |

**Webhook (optional)**

| Settings        | Default  | Description                                                               |
|-----------------|----------|---------------------------------------------------------------------------|
| webhook.events          | `['*']`  | Acceptable events. Use `['*']` to allow all events                        |
| webhook.signature       |          | Secret provided by `x-webhook-token` header. Or missing to disabled it.   |
| webhook.headers.event      | `x-webhook-event`  | Key of the received header which contains events        |
| ❌ webhook.headers.token  | `x-webhook-token`  | Key of the received header which contains signature     |

> A `x-webhook-event: my-event` header must be provided to match with settings events.  
> if `webhook.signature` setting is provided, a `x-webhook-token: sha1=xxxxxxxxx` header must be provided where `xxxxxxxxx` is the sha1 __cyphered__ secret.   
> You can generate a signature using [sha1-online.com](http://www.sha1-online.com/)


**🟧 PROPOSAL |** **Multipart - file upload (optional)**

| Settings        | Default  | Description                                                               |
|-----------------|----------|---------------------------------------------------------------------------|
| multipart.mkdir    | `true`   | Create recursively directory specified in `upload.path` if not exists. |
| multipart.chmod    |          | Change uploaded file rights. Allowed all syntax (e.i.: `g+x`, `755`).  | 
| multipart.owner    |          | Change uploaded file owner. Format: `user:group`.|
| multipart.path     | `/tmp`   | Upload posted files to this directory. |
| multipart.limit    | `1_000_000`| Allowed file upload limit in **Byte** .`0` = disable upload.|
| multipart.filename |          | Change uploaded filename.|

**🟧 PROPOSAL |** **Authorization (optional)**

| Settings        | Default  | Description                                                               |
|-----------------|----------|---------------------------------------------------------------------------|
| authorization.header    | `authorization`   | Header name used for authorization |
| authorization.secret    |                   | JWT secret to confirm authorization |


**🟧 PROPOSAL |** **TLS (optional)**

| Settings        | Default  | Description        |
|-----------------|----------|--------------------|
| tls.key         |    | Path to key              |
| tls.cert        |    | Path to certificate      |
| tls.passphrase  |    | Password / Passphrase    |

Using OpenSSL, we will generate our key and cert. So, here’s how you could do this:

```sell
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365
```

Test source with curl using https like this `curl -k https://localhost:8080`.


## Record

This node publishes record data with this additional fields:

```json
{
  "id": "<uuid4>",
  "timestamp": "<timestamp>",
  "url": "<url>",
  "method": "<method>",
  "headers": "<headers>",
  "body": "<body>"
}
```

## Testing

Try this `curl` request on default configuration.

```bash
curl -X POST \
     -H 'Content-Type: application/json' \
     -H 'X-webhook-event: write' \
     -H 'x-webhook-token: sha1=7b502c3a1f48c8609ae212cdfb639dee39673f5e' \
     -d '{"repository": "my-repo", "build": 1}' \
     http://localhost:8080/
```

Source will produce following record: 

```json
{
  "url": "/",
  "method": "POST",
  "headers": {
    "host": "localhost:8080",
    "user-agent": "curl/7.68.0",
    "accept": "*/*",
    "content-type": "application/json",
    "x-webhook-event": "write",
    "x-webhook-token": "sha1=7b502c3a1f48c8609ae212cdfb639dee39673f5e",
    "content-length": "37"
  },
  "body": {
    "repository": "my-repo",
    "build": 1
  },
  "id": "c9ab3879-f83e-450b-955f-c76c3a67a91b",
  "timestamp": 1617228309268
}
```
