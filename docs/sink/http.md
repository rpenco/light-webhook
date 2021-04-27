# HTTP Sink

> 🟡 PARTIAL IMPLEMENTATION    
> This source has a partial implementation.   
> Each unavailable feature is indicated as __🟧 PROPOSAL__ or __❌ not available__.


## Usage

Send an HTTP request to another endpoint.

```yaml
type: http-sink
settings:
  url: http://myotherservice.com
  method: GET
  headers:
    Content-Type: application/json
    x-custom-header: '{{stringify(it.data.param)}}'
  body: '{{stringify(it)}}'
    

```

### Settings

**Server configuration**

| Settings        | Default  | Description                                                               |
|-----------------|----------|---------------------------------------------------------------------------|
| url             |          | Remote URL |
| method          | `post`   | Acceptable HTTP method (`get`, `post`, `put`, `delete`)                   |
| headers         | `[]`     | Request headers to add                |
| body            | `{{stringify(it)}}`      | Body template                 |

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

This node publishes record with this additional fields:

```json
{
  "response":  "<Http response body>"
}
```