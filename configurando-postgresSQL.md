# Configurando PostgreSQL

## Instalación

### Instalando postgres

La primero que necesitamos hacer es instalar postgres.

#### OS X

Si estas en una Mac, podes ir directo a [http://postgresapp.com/ ](http://postgresapp.com/) y seguir las instrucciones ahí para tener instalación completa de postgres, incluyendo el CLI psql. Estate seguro de [configurar tu $PATH link](http://postgresapp.com/documentation/cli-tools.html) y seguir las instrucciones ahí.

#### Ubuntu

Seguí esta [link para una visión mas profunda](https://help.ubuntu.com/community/PostgreSQL). En general, esta es la secuencia de comandos vimos funcionar para otros:

```sh
sudo apt-get install postgresql postgresql-contrib
sudo -u postgres createuser --superuser $USER
createdb $USER
```

Finalmente, luego cuando usemos la librería `sequelize` de node.js, vamos a intentar conectar a nuestro servidor PostgresSQL local usando Javascript - e.g. `var db = new Sequelize('postgres://localhost/database_name')`. Por defecto PostgreSQL va a requerir un nombre de usuario y contraseña para esas conexiones, y eso significa que vamos a necesitar incluir eso en nuestro código de Javascript: `('postgres://username:password@localhost/database_name')`. En orden de evitar ese dolor de cabeza hemos encontrado útil configurar como "trust" esas conexiones.

Continuá a `/etc/postgresql/VERSION_NUMBER_HERE/main/pg_hba.conf` y editalo.
(vas a necesitar editarlo usando sudo - de otra manera, puede mostrar un archivo vacio). Específicamente editá las lineas que se vean algo asi...

```
# IPv4 local connections:
host    all             all             127.0.0.1/32            md5
# IPv6 local connections:
host    all             all             ::1/128                 md5
```

...`md5` => `trust`:

```
# IPv4 local connections:
host    all             all             127.0.0.1/32            trust
# IPv6 local connections:
host    all             all             ::1/128                 trust
```

Luego de actualizar tu archivo .conf, vas a necesitar reiniciar el proceso de postgres; podes hacerlo con el siguiente comando desde la terminal:

```sh
sudo upstart restart postgresql
```

### Navegando el CLI de postgres

Ahora, vamos a usar el CLI psql para crear nuestra base de datos! Ve adelante y tipeá dentro de la terminal para comenzar:

```sh
psql
```

(Alternativamente, si  instalaste el paquete Postgres.app, vas a tener un amigable elefante en tu computadora en el menú bar que podes clickear en cualquier momento, que va a abrir el menú con varias opciones incluendo "Open psql".)

Vas a ver un prompt que se ve como el siguiente

```
yourusername=#
```

Este es el CLI de psql. Para aprender de los comandos básicos, [mira los docs](http://postgresguide.com/utilities/psql.html). En particular, estate seguro de encontrar que son: `\l`, `\d`, `\d+`, y `\c`. Una vez que sabes como listar tu base de datos y tablas, y conectar a una base de datos específica, estas listo para comenzar usando postgres en tu propio proyecto!

### Repaso Comandos básicos

Repasemos información esencial para los varios comandos que vamos a usar:

`\c dbname` - Connect. Esto va a conectarte a la base de datos con el nombre que pases como argumento.

`\l` - List. Esto va a darte una lista de todas tus base de datos.

`\d` - Describe. **Eso es importante!** Una vez conectado a la base de datos, esto va a darte una lista de todas tus tablas, vistas y secuencias en la base de datos. (Si no sabes que son vistas y secuencias - una vista es algo que un administrador de una base de datos puede asignar a un usuario especifico para que cuando ese usuario haga queries a una tabla, solo un set de información (como filas y columnas) que el administrador ha juzgado como relevante van a aparecer como resultado. Una secuencia es solo una forma para postgres para mantener rastro de secuencias de números para que pueda auto-incrementar cosas como ids). Por defecto, `\d` es equivalente a `\dtvs` - significando que vas a listar tablas, vistas, y secuencias, pero podes limitarlo solo tipeando `dt`, `dv`, `ds`. 

Por ejemplo, si estamos conectados a la base de datos de Twitter y escribís `\d`, podemos ver algo así: 

```
             List of relations
 Schema |     Name      |   Type   | Owner 
--------+---------------+----------+-------
 public | tweets        | table    | twitter
 public | tweets_id_seq | sequence | twitter
 public | users         | table    | twitter
 public | users_id_seq  | sequence | twitter
 
```

Sin embargo, si solo estamos interesados en tablas, podemos simplemente tipear `\dt` y tener resultados mas prolijos: 

```
             List of relations
 Schema |     Name      |   Type   | Owner 
--------+---------------+----------+-------
 public | tweets        | table    | twitter
 public | users         | table    | twitter
```

`\q` - Quit. Esto te va a desconectar de `psql`. Porque todas las buenas cosas deben llegar a un final…
