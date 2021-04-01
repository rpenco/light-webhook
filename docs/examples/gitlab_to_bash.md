# Gitlab to Bash


```bash
port: 8081

pipelines:
  - name: gitlab_pipeline
    nodes:
      - name: input_push
        type: gitlab
        settings:
          events: ["push", "merge_request"]
      - name: print
        type: bash
        settings:
          pwd: "/tmp"
          command: "echo"
          arguments:
            - "{{ stringify(options) /}}"
```