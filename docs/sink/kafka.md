# Kafka sink

> 🟡 PARTIAL IMPLEMENTATION    
> This sink has a partial implementation.   
> Each unavailable feature is indicated as __🟧 PROPOSAL__ or __❌ not available__.

## Usage

Create Kafka producer to emit kafka message.

```yaml
type: kafka-sink
settings:
    host: localhost:9092
    encoding: 'utf8'
    keyEncoding: 'utf8'
    autoCommit: true
    topics:
        topic: my-topic
        partition: 0
        offset: 0
```

### Settings

**Server configuration**

| Settings        | Default  | Description                                                               |
|-----------------|----------|---------------------------------------------------------------------------|
| host | `127.0.0.1:9092` | kafka client host and port|
| topics | `[]`|  Topic list `{ topic: string, partition: number, offset: number }`               |
| autoCommit | `true`|  auto commit |
| groupId | |  consumer group id|
| keyEncoding | `utf8` |  key encoding `utf8` or `buffer` |
| encoding | `utf8`|  value encoding `utf8` or `buffer`|

## Record

This node publishes record with this additional fields:

```json
{
  "message": "<kafka message>"
}
```

