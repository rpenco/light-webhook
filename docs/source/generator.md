# Generator Source

> 🟢 STABLE | This source is stable.

## Description

Generate a periodic custom message.

## Usage

```yaml
type: generator-source
settings:
    message: Hello
    interval: 1000
```

### Settings

**Server configuration**

| Settings        | Default  | Description                                     |
|-----------------|----------|-------------------------------------------------|
| message         | `hello world!` | Message to generate. Support templating   |
| interval        | `1000`   | Send event at specified interval                |


## Record

This node publishes record data with this additional fields:

```json
{
  "message": "<message>",
  "counter": "<counter>"
}
```

## Testing

You can configure a source like: 

```yaml
- name: generator
  type: generator-source
  settings:
    message: Hello id={{it.id}} time={{it.timestamp}} count={{it.counter}}
    interval: 1000
  out:
    - console
```

Source will produce following record: 

```json
{
  "message":"Hello id=ac651d10-5027-416e-8761-13a02d640b85 time=1617370853083 count=1",
  "counter":1
}
```
