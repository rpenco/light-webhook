# Elasticsearch Sink

> NOT IMPLEMENTED YET!  
> This page is an implementation proposal.

## Usage

Send body to an elasticsearch cluster.

```yaml
type: elasticsearch-sink
settings:
  host: localhost:9200
  index: "my-index"
  type: "_doc"
```

## Record

This node publishes record with this additional fields:

```json
{
  "elasticsearch": {
    "index": "my-index",
    "type": "_doc",
    "id": "<id>"
  }
}
```