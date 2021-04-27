# File Source

> 🟡 PARTIAL IMPLEMENTATION    
> This source has a partial implementation.   
> Each unavailable feature is indicated as __🟧 PROPOSAL__ or __❌ not available__.

## Usage

Watch file change and send event with content.  

> __❌ not available__ | Source can only watch one file for moment. Directory and pattern filter will be added soon. 

```yaml
type: file-source
settings:
    file: /absolute/path/to/watch/file.txt
    load: true
```


### Settings

**Server configuration**

| Settings        | Default  | Description                                                               |
|-----------------|----------|---------------------------------------------------------------------------|
| file            |          | Absolute or relative path to directory or file to watch                  |
| load            | `true`   | Load file content into record (**can cause out of memory**)              |


### Record

This node publishes record with this additional fields:

```json
{
  "files": [
    {
      "path": "/absolute/path/to/file.txt",
      "size": 1000,
      "creationDate": 123456789,
      "modificationDate": 123456789,
      "groupId": 1000,
      "userId": 1000,
      "content": "<FILE CONTENT OR BINARY IF LOAD IS TRUE>"
    }
  ]
}
```

