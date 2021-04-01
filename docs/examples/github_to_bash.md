# Github to file

```yaml
# Application port
port: 8080
logger:
  level: info
  files:
  - filename: /var/log/combined.log
    level: info
  - filename: /var/log/error.log
    level: error
    
# Pipelines
pipelines:
  - name: github_push_pipeline
    nodes:
      - name: input_push
        type: github
        settings:
          events: ["push"]
          signature: "kdsodznvaz234rn"

      - name: execute_push
        type: bash
        settings:
          pwd: "/tmp"
          command: "echo"
          arguments:
            - "event: {{headers['x-github-event']}}, url: {{data.hook.url}}"
```