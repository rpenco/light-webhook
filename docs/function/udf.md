# User Defined Function

> NOT IMPLEMENTED YET!  
> This page is an implementation proposal.

You can define your own `User Defined Function` with your own libraries, implementing pure Javascript functions.

# Usage 

```yaml
type: udf-fn
settings:
  myid: 1
  execute: |
    // import all you need in commonjs bundle
    const tools = require('./my-custom-lib.js');
    
    // export simple function with 2 parametres
    // suscriber.next(<Record>) to publish record
    // param record is received record to threat 
    export default function(subscriber, record){
    
        const enrichedData = tools.perform(record.getData());
        record.setData(enrichedData);
        record.setId(this.settings().myid);   
        subscriber.next(record);
    }
      
  resolve: |
    export default function(record){
        // optional User defined function executed when record end stream with success
    }    

  reject: |
    export default function(record){
        // optional User defined function executed when record end stream with failure
    }   
}
```

## API

### Record

You can edit input record using `getData()`, `setData(<data>)`, `getId()`, `setId()` record methods

```js
record.getId();
```

```js
record.getData();
```

### Settings

You can read all node settings using `this.settings()` method.

```js
const settings = this.settings();
const host = settings.host;
const port = settings.port;
```

