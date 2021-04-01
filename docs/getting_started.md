# Getting started

## Download 

Install `light-webhook` application.

```bash
yarn i -g light-webhook --no-optional
```

## Configure

Create a `configuration.yaml` file with this following content.

```yaml
name: simple-stream
interval: 1000
stream:
    -   name: generator
        type: generator-source
        settings:
            message: Hello world!
        out:
            - bash

    -   name: bash
        type: bash-sink
        settings:
            command: ls
            arguments: [-l]
        out:
            - console2

    -   name: console
        type: console-sink
        settings:
            format: plain

```

Then execute your stream.

```bash
light-webhook -c ./configuration.yaml
```

You should see something like this:


```bash
info: stream started...
info: bash receive record
info: console> total 5540
-rw-rw-r--   1 user user       0 mars  30 14:53 CHANGELOG
-rw-rw-r--   1 user user    3332 mars  30 14:53 CODE_OF_CONDUCT.md
-rw-rw-r--   1 user user 5111481 mars  31 16:35 combined.log
-rw-rw-r--   1 user user    4190 mars  30 14:53 CONTRIBUTING.md
-rw-rw-r--   1 user user       0 mars  30 14:53 custom.d.ts
drwxrwxr-x   2 user user    4096 mars  30 16:58 dist
drwxrwxr-x   7 user user    4096 mars  31 16:35 docs
-rw-rw-r--   1 user user     489 mars  31 00:17 error.log
-rw-rw-r--   1 user user    1057 mars  30 14:53 LICENSE
drwxrwxr-x 488 user user   20480 mars  31 13:51 node_modules
-rw-rw-r--   1 user user    2541 mars  31 13:54 package.json
-rw-rw-r--   1 user user  289846 mars  30 14:53 package-lock.json
-rw-rw-r--   1 user user     656 mars  30 14:53 PULL_REQUEST_TEMPLATE.md
-rw-rw-r--   1 user user     780 mars  31 16:35 README.md
drwxrwxr-x   6 user user    4096 mars  31 13:51 src
drwxrwxr-x   2 user user    4096 mars  31 16:35 test
-rw-rw-r--   1 user user     449 mars  31 13:53 tsconfig.json
-rw-rw-r--   1 user user     960 mars  30 17:43 webpack.config.js
-rw-rw-r--   1 user user  188053 mars  31 13:51 yarn.lock

```
Well done ! :100:
