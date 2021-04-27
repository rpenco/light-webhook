# Bash Sink

> 🟢 STABLE | This sink is stable.

## Description

Call a local bash command or script.

## Usage

```yaml
type: bash-sink
settings:
  pwd: /home/me
  command: myscript.sh
  arguments:
    - "{{ it.header['x-webhook-event'] /}}"
    - "{{ it.body.url }}"
  environments:
    - MY_KEY=myvalue
```

> Can execute my custom script: `./my-script.sh list https://github.com/rpenco/light-webhook`

### Settings

| Settings        | Default   | Description                                             |
|-----------------|-----------|---------------------------------------------------------|
| pwd             | _current_ | Change working directory before executing command.      |
| command         |           | Bash command to execute.                                | 
| arguments       |           | Command arguments.                                      |
| environments    |           | Execution environment variables.                        |

## Record

This node publishes record with this additional fields:

```json
{
  "code": 0,
  "stdout": "<stdout>",
  "stderr": "<stderr>"
}
```