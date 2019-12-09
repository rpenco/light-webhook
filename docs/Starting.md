

## Generate cert.pem and key.pem

Using OpenSSL, we will generate our key and cert. So, here’s how you could do this:

> Make sure to run above command inside the directory where application is present.

```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365
```