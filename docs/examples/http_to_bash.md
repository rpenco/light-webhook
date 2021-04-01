# HTTP to File stream


## Configuration

```yaml
pipelines:
    - name: http_pipeline
      nodes:
          - name: input
            type: http
            settings:
                events: ["upload_event"]

          - name: print
            type: bash
            settings:
                pwd: "/tmp"
                command: "echo"
                arguments:
                    - "{{ headers['content-type'] }}"
```

And configure [a github lib](https://developer.github.com/webhooks/creating/) to point to `http://example.com:8080/webclient1/my-github`.

That's all, when you `push` your changes in your git repository, `light-webhook` app is triggered and execute the `echo` bash command.

You can now execute any action (bash, HTTP request) from any HTTP event (Github, Gitlab, Custom HTTP) ! 


