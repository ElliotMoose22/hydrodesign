# McGill Hydro Design

Public site for [hydrodesign.mcgilleus.ca](https://hydrodesign.mcgilleus.ca).

## Preview

```bash
python -m http.server 8787
```

Open [http://127.0.0.1:8787](http://127.0.0.1:8787).

## Deploy

Static files live on Charizard at `/var/www/statics/hydrodesign`. The Caddy vhost is in [McGillEUS/sites-enabled](https://github.com/McGillEUS/sites-enabled) as `hydrodesign.caddy`.
