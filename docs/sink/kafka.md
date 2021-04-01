# Kafka Sink

> NOT IMPLEMENTED YET!  
> This page is an implementation proposal.

## Usage

Send body to a kafka broker.

```yaml
type: kafka-sink
settings:
  host: localhost:9092
  topic: my-topic
  partition: 0
```

## Record

This node publishes record with this additional fields:

```json
{
  // kafka metadata
}
```