# light-webhook

[![Build Status](https://travis-ci.org/rpenco/light-webhook.svg?branch=2.x)](https://travis-ci.org/rpenco/light-webhook)
[![npm version](https://badge.fury.io/js/light-webhook.svg)](https://badge.fury.io/js/light-webhook)
[![Package Quality](https://npm.packagequality.com/shield/light-webhook.png)](https://packagequality.com/#?package=light-webhook)
[![NPM](https://img.shields.io/npm/dt/light-webhook.svg)](https://npmjs.org/package/light-webhook)  

[![Issue open](https://img.shields.io/github/issues/rpenco/light-webhook)](https://npmjs.org/package/light-webhook)
[![Docker](https://img.shields.io/docker/pulls/rpenco/light-webhook.svg)](https://npmjs.org/package/light-webhook)

> 👷 THIS VERSION IS UNDER DEVELOPMENT.  
> Use [this version (1.0.6)](https://github.com/rpenco/light-webhook/tree/1.0) or help me contributing. 

## ✨ Overview

`light-webhook` is a lightweight application for receiving webhooks from different sources, processing them as streams and publishing the results in sinks.  

### 🔥 Quick start example 

Create a `configuration.yml` file with this following configuration.

```yaml
name: github_webhook_to_bash_script             
stream:                             
    - name: github               
      type: github-source        
      settings:
        host: 127.0.0.0
        port: 8080
        path: /github
        events:
            - push
            - merge_request
      out:
        - console                 
        - bash                 

    # print received github request body 
    - name: console              
      type: console-sink         
      settings:                  
          format: json
    
    # execute custom script based on github request body
    - name: bash
      type: bash-sink
      settings:
          command: ./custom_script.sh
          args: ["--req", "{{@stringify(it)}}"]
```

Then launch application `light-webhook -c configuration.yml` and send Github webhook to `http://127.0.0.1:8080/github`.
Voilà, you `custom_script.sh` will be executed with arguments based on received Github request 

## 📕 Documentation

 - **[Read complete documentation](https://rpenco.github.io/light-webhook/)**


## Docker 

[](https://hub.docker.com/r/rpenco/light-webhook)
You can pass your configuration using `/conf/configuration.yaml` mounted volume. 

```bash
docker run --name light-webhook -v $(pwd)/test/configuration.yaml:/conf/configuration.yaml -p 8080:8080 rpenco/light-webhook:2
```

## 📄 Licences

MIT License