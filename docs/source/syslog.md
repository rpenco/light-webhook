# Syslog source

> NOT IMPLEMENTED YET!  
> This page is an implementation proposal.


## Usage

```yaml
type: syslog-source
settings:
    host: localhost:9092
    mode: tcp
```

## Record

This node publishes record with this additional fields:

```json
{
  // syslog message
}
```