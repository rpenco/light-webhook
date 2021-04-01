# Deploy

> 🟢 STABLE | This documentation is stable.

## 🪛 Run from source

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
yarn release:pack
```

Run a [configuration](configuration.md)

```bash
node dist/light-webhook -c test/configuration.yaml
```

## 🪛 Run with NPM

[NPM official page](https://www.npmjs.com/package/light-webhook).

Simply install package with `global` option.

```bash
npm install -g light-webhook@2.0.0-alpha.1
```

Then execute your configuration.

```bash
light-webhook -c test/configuration.yaml
```


## 🪛 Run with Docker

[Docker Hub official page](https://hub.docker.com/r/rpenco/light-webhook).

You can pass your configuration using `/conf/configuration.yaml` mounted volume.

```bash
docker run --name light-webhook -v $(pwd)/test/configuration.yaml:/conf/configuration.yaml -p 8080:8080 rpenco/light-webhook:2.0.0-alpha.1
```

## 🪛 Run from Tarball

Download source from [Github release page](https://github.com/rpenco/light-webhook/releases).

```bash
tar -xvf light-webhook-2.0.0-alpha.1.tgz
# (optional: set executable mode) chmod +x package/dist/light-webhook.js
./package/dist/light-webhook.js -c test/configuration.yaml
```