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
node dist/bundle.js -conf configuration.yaml
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

Using in memory configuration file.

You can pass your configuration using `CONFIGURATION` environment variable.

```bash
$ docker run --name light-webhook -p 8080:8080 -e CONFIGURATION:@configuration.yml rpenco/light-webhook:2.0
```

Using volume configuration.

You can mount your configuration volume into `/configuration` path.

```bash
$ docker run --name light-webhook -p 8080:8080 -v ./configuration:/configuration rpenco/light-webhook:2.0
```