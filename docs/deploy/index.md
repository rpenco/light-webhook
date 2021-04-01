# Deploy

> NOT IMPLEMENTED YET!

## From source

Clone repository
```bash
git clone git@github.com:rpenco/light-webhook.git
```

Install dependencies

```bash
yarn install
```

Compile sources

```bash
yarn build
```

Run a [configuration](configuration.md)

```bash
node dist/light-webhook.js -conf configuration.yaml
```

## Local deployment

Install application

```bash
yarn add light-webhook -g
```

Run a [configuration](configuration.md)

```bash
light-webhook -c configuration.yaml
```


## Docker deployment

**Using volume**

You can pass your configuration using `/conf/configuration.yaml` mounted volume.  
For example, start container with http server listening on 8080 and with local configuration is located at `$(pwd)/test/configuration.yml`.

```bash
docker run --name light-webhook -v $(pwd)/test:/conf -p 8080:8080 rpenco/light-webhook:2
```
