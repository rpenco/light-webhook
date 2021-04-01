# Kafka source

> NOT IMPLEMENTED YET!  
> This page is an implementation proposal.


## Usage

```yaml
type: kafka-source
settings:
    host: localhost:9092
    topic: my-topic
    groupId: my-group
    partition: 0
    commit: lastest
    offset: 0
```

## Record

This node publishes record with this additional fields:

```json
{
  // kafka record 
}
```

