# Console Sink

> 🟢 STABLE | This sink is globally stable.

## Description

Print record into terminal or forward printed result.

## Usage

```yaml
type: console-sink
settings:
    format: 'json'
    level: 'info'
    prefix: '{{node.name}} >'
    passThrough: true
```

## Settings

| Settings        | Default   | Description                                                               |
|-----------------|-----------|---------------------------------------------------------------------------|
| format       | `json` | Choose print format `json`, `pretty-json`, `plain`                              |
| level        | `info` | Choose print level `silly`, `debug`, `verbose`, `info`, `warn`, `error`         |
| prefix       | `{{node.name}} >` | Print line prefix |
| passThrough  | `true` | Do not forward printed line to next node. Received record will be pass through without modification |

## Record

If `passThrough: true`, emitted record will be **same as received** record, otherwise, emitted record will have this additional fields:

```json
{
  "console": "<printable string>"
}
```