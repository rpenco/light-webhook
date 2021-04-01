# File source

> 🔴 NOT IMPLEMENTED  
> This page is an implementation proposal.

## Usage

```yaml
type: file-source
settings:
    path: /absolute/path/to/watch
    pattern: .*
    maxSize: 1000000
    load: true
```

### Settings

- **path**: absolute or relative path to directory or file to watch
- **pattern**: matching pattern (regex) to filter files to watch
- **maxSize**: max file size (in byte) to filter files to watch
- **load**: load files in record (**can cause out of memory**)


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
      "file": "<FILE CONTENT OR BINARY IF LOAD IS TRUE>"
    }
  ]
}
```

- **path**: file path
- **size**: file size
- **creationDate**: creation date
- **modificationDate**: modification date
- **file**: file content