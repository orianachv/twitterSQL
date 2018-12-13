# Twitter.sql

## Configurando Postgres

### Intro

Nuestra app Twitter.js es genial, pero cuando el proceso de Node termina perdemos toda nuestra información! Hoy, vamos a arreglar eso agregando una base de datos SQL (específicamente postgres). Vamos a reemplazar completamente nuestro archivo `tweetBank.js`. Podes borrarlo si querés. No va a haber necesidad de cambiar el código en el archivo `tweetBank.js`

Usa [este punto de inicio](https://github.com/atralice/twitter-sql) o tu propia solución de Twitter.js si lo deseas. Si usas tu propia solución, tene en cuenta que lo que viene va a ser relativo al punto de inicio compartido, y va ser mas difícil de seguir si estas trabajando desde tu propia implementación.

### Instalando Postgres

Si esta es tu primera vez usando postgres y psql (el CLI de postgres), vas a necesitar configurarlo primero. Navega al workshop de [Configurando Postgres](https://github.com/atralice/twitter-sql/blob/master/configurando-postgresSQL.md)
(no te preocupes - no es muy largo!) y acostumbrate a postgres. Cuando estés listo, continua para aprender como crear tu propia base de datos.

### Creando una nueva base de datos

Ahora que estas familiarizado con postgres y los comandos de psql, continuemos y creemos nuestra primera base de datos. Usa el comando `CREATE DATABASE` para crear una base de datos llamada twitterdb.

Recuerdas cómo crear una base de datos?

+++
`CREATE DATABASE dbname;`
+++

Si listas tu base de datos, vas a ver algo como esto:

```
                                  List of databases
   Name    |  Owner   | Encoding |   Collate   |    Ctype    |   Access privileges   
-----------+----------+----------+-------------+-------------+-----------------------
 postgres  | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | 
 template0 | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | =c/postgres          +
           |          |          |             |             | postgres=CTc/postgres
 template1 | postgres | UTF8     | en_US.UTF-8 | en_US.UTF-8 | =c/postgres          +
           |          |          |             |             | postgres=CTc/postgres
 fsa       | fsa      | UTF8     | en_US.UTF-8 | en_US.UTF-8 | 
 twitterdb | fsa      | UTF8     | en_US.UTF-8 | en_US.UTF-8 |
```

### Definí las tablas

Ahora vamos a guardar usuarios que tienen nombres y avatares, y Tweets con contenido y referencias al id de su autor.

Primero, conectemos a nuestra base datos usando el comando `\c`

```
\c twitterdb
```

Ahora, continua y usa un poco de SQL para crear tablas:

```sql
CREATE TABLE users (
id SERIAL PRIMARY KEY,
name TEXT DEFAULT NULL,
picture_url TEXT
);

CREATE TABLE tweets (
id SERIAL PRIMARY KEY,
user_id INTEGER REFERENCES users(id) NOT NULL,
content TEXT DEFAULT NULL
);
```


Si usas el comando `\d`, deberías ahora ver Users y Tweets!

Si usas el comando `\d+`, podes ver información detallada del esquema. Este comando va ser útil cuando estés cambiando tu esquema frecuentemente luego.  

Por cierto, te estas preguntando qué es ese `SERIAL`? Esto es el equivalente de `AUTOINCREMENT` en sqlite - cuando un nuevo tweet o usuario es creado, va a automáticamente incrementar el primary key! Esto evita que tengas que explícitamente incluir un primary key cuando agregues un row a tu tabla.


### Seedear la base de datos

Una necesidad común durante el desarrollo es ser capaz de rápida y fácilmente seedear una base de datos - llenarlo con data realista para que podamos testear como funciona nuestra aplicación. Para ese fin, un seed script viene muy útil. Nos adelantamos e hicimos un script de SQL para vos en el repo. Primero, lee un poco por arriba el archivo `twitterjs-seed.sql` y luego haz lo siguiente:

##### Opción A: Desde la Terminal

```sh
psql -d your_database_name -a -f path/to/your/seedfile.sql
```

##### Opción B: Desde PSQL, luego de conectarte a la base de datos que querés seedear

```
\i path/to/your/seedfile.sql
```

Confirma que la base de datos se seedeó  correctamente con alguna declaración de `SELECT` básica para ambas tablas.   


## Usando el cliente node-postgres

### Teoría: servidores, clientes, shells y drivers 


Leyendo y escribiendo a una base de datos PostgreSQL ocurre a través de varias capas. Lo siguiente es todo teoría - ningún paso del workshop en esta sección

#### EL DBMS: `postgres`

El Database Managment System(DBMS) es el cerebro de nuestra solución de almacenamiento persistente. Es el responsable de traducir *queries* declarativos a operaciones dentro del sistema de archivos. En el caso de PostgreSQL, el DBMS es el proceso postgres corriendo detrás de escena. De hecho, postgres es un **servidor** TCP/IP escuchando en un puerto! ..No un protocolo HTTP, pero un servidor de [Postgres-protocol](https://www.postgresql.org/docs/current/static/protocol.html).

#### Clientes DBMS 

El DBMS/servidor de postgres se sitúa en el fondo listo para recibir *queries*. Entonces, cómo transmitimos una query a postgres realmente? Un cliente necesita conectarse a el y enviar SQL acorde al protocolo que postgres espera. 

#### El cliente `psql`: Una interfaz humana (shell)

El shell de [`psql`](https://www.postgresql.org/docs/current/static/app-psql.html) es un cliente diseñado para aceptar una entrada de queries SQL a través del teclado por un ser humano, transmitir esas queries a `postgres`, e imprimir el resultado. Es conceptualmente similar al REPL de Node.js, o a Bash. Internamente, `psql` sabe como formar conexiones y comunicarse con `postgres`.

#### El cliente pg: una app de interfaz (driver)

Nuestra aplicación Twitter.js  no es una persona y no tiene necesidad de entrar comandos a través de un teclado. Si estudiamos el [protocolo](https://www.postgresql.org/docs/current/static/protocol.html) para conectar postgres y transmitir queries, podemos ser capaces de implementar la compleja lógica dentro de nuestro Node app, y Twitter.js sería un cliente de la base de datos. Eso sería demasiado trabajo, sin embargo, y muy susceptible a errores. Imagina si cada desarrollador tuviera que escribir su propio código de TCP/IP; probablemente no iría muy bien! 

En cambio, podemos confiar en un driver de base de datos. Un driver es un cliente escrito para ser un puente entre la brecha entre nuestra aplicación y la DBMS. Como psql o cualquier otro cliente, correctamente implementa el protocolo para hablar con postgres. Pero donde psql expone el teclado como un método de entrada, el driver expone una API - Application Programming Interface. Apps escritas en su lenguaje nativo pueden luego usar esa API para enviar queries.

El cliente que vamos a usar en nuestro servidor de Node es [`node-postgres`](https://github.com/brianc/node-postgres), disponible en npm como [`pg`](https://www.npmjs.com/package/pg). Este driver nos permite usar JavaScript enviar queries a nuestra base de datos. El path final para un query SQL es el siguiente: 


##### Enviando el pedido a la base de datos:

1. Node app: nuestro código llama una función provista por `pg`, pasando un string con un SQL query
2. `pg` driver: se conecta a `postgres` como un cliente y envía el query SQL usando el protocolo correcto
3. Servidor `postgres`: traduce el query a ejecutar una serie de operaciones dentro del sistema de archivos.  

##### Recibiendo la respuesta de la base de datos

1. Servidor `postgres`: envía los resultados de las operaciones en el sistema de archivos al pg driver conectado.
2. pg driver: parsea la respuesta y construye un arreglo JS de la data
3. Node app: recibe el arreglo en una función callback

### Instalando el cliente

Ok, sabemos que un driver es ahora, usemoslo! Comienza instalando el módulo.

```sh
npm install --save pg
```

Chequeá los [documentos](https://github.com/brianc/node-postgres) y mirá si podes conseguir que tu servidor se comunique con la base de datos. La siguiente sección va a entrar en detalle en nuestra aproximación, pero trata sin nuestra guía primero.


#### Nota al Pie

El módulo `pg`  esta escrito enteramente en JS. Para mayor velocidad, sin embargo, se puede instalar opcionalmente `pg-native`, que esta parcialmente escrita en C++. Para hace que `pg` use estos códigos nativos requiere un muy pequeño cambio en código de la aplicación; no te lo mostraremos, pero quizás puedas encontrarlo en los docs de `pg`?


### Conectándose a la base de datos

Nuestras rutas van a necesitar acceso a la base de datos del cliente. Si tenemos muchos archivos de rutas, cada uno puede incluir el cliente de la base de datos como una dependencia. Vamos a abstraer este objecto del cliente a un módulo para que podamos fácilmente requerirlo.

Crea una nueva carpeta, `db`, y colocá un `index.js` en el. Dentro de ese nuevo archivo, requerí el paquete `pg` y crea una conexión a nuestra base de datos. Podes intentar de configurar por vos mismo siguiendo la documentación [aquí](https://github.com/brianc/node-postgres#client-instance). Fíjate en dos excepciones: 

- Con una instalación de Postgres normal (usando `trust` authentication), podes omitir el usuario y la contraseña en el string de conexión.
- El callback de `connect` es opcional; `connect` se comporta sincrónicamente y va tirar un error si la conexión falla. 


Exportá el cliente de este módulo. Si crees que lo tienes, mirá la pista de abajo para ver nuestra versión.



+++Creando el modulo del cliente
```js
// configurando el node-postgres driver
var pg = require('pg');
var postgresUrl = 'postgres://localhost/___YOUR_DB_NAME_HERE___';
var client = new pg.Client(postgresUrl);

// conectando al servidor de postgres
client.connect();

// hacer el cliente disponible como un módulo de Node
module.exports = client;
```
+++

### Escribiendo queries

Estamos tan cerca! Importá el módulo del cliente en el módulo routes. Ahora nuestras rutas pueden usar el cliente de la base de datos para hacer queries. Por ejemplo:

```js
client.query('SELECT * FROM tweets', function (err, result) {
  if (err) return next(err); // pasa el error a Express
  var tweets = result.rows;
  res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
});
```

El método `query` toma un callback con el resultado de ejecutar el query. El objeto del resultado tiene meta-data adjuntada a él, pero si solo queremos las rows devueltas, podemos acceder a ellas vía `.rows`.

### Usando interpolación de string 

Podemos rápidamente llegar a una situación complicada una ves que necesitamos incluir data de nuestro cliente a las queries. Afortunadamente, node-postres nos provee de una sintaxis para interpolar strings, o queries parametrizados.

Para usarlo, podes incluir números anexados con el símbolo `$` en tu query-string, e incluir un arreglo de argumentos para pasar al query (nota: index 0 del arreglo corresponde al `$1` en el query):

```js
client.query('SELECT name FROM users WHERE name=$1', ['Toni'], function (err, data) {/** ... */});

client.query('INSERT INTO tweets (userId, content) VALUES ($1, $2)', [10, 'I love SQL!'], function (err, data) {/** ... */});
```

Esto sirve para dos propósitos. Primero, hace mucho más fácil pasar data a los queries. Segundo, y lo mas importante, detrás de escena esto nos protege en contra de [SQL injection](https://xkcd.com/327/). No queremos ningún usuario con nombre extraño destruyendo nuestras tablas, o no?

## Haz que suceda

### El Gran Paso

Ok, es hora para que este pichón vuele de su nido (lo entiendes? Twitter? Pajaritos?).

Con tu nuevos poderes de postgres, modificá tus rutas para que hablen con la base de datos en vez de con tweetBank (podes cambiar otros archivos también e.g. tus templates). De hecho, quizás quieras borrar o comentar el tweetBank por completo para asegurarte que realmente estas usando la base de datos. 

Tareas:
- Refrescar / cargar la página o reiniciar el servidor muestra todos los tweets en la base de datos.
- Clickear un usuario muestra todos los tweets de ese usario.
- Clickear un tweet muestra solamente ese tweet.
- Postear un tweet con un nombre existente crea un nuevo tweet en al db con el UserID correcto.
- Postear un tweet con un nuevo nombre crea un nuevo tweet y un nuevo usuario en la base de datos.

## Conclusión

### Bonus

Si haz terminado con todo lo demás, aca hay otras sugerencias para construir más nuestra app:

- Implementá un input de búsqueda que dado un string encuentra tweets relevantes.
- Tratá de construir un feature de tags. Los usuarios deberían ser capaz de agregar tags a sus tweets, también como poder filtrar la lista de tweets basados en tags.
- Tratá de crear un botón de "retweet". Debería hacer... lo que sea que haces cuando retweeteás algo.
- Agregá un botón "delete" para los tweets. Clickear el botón debería disparar un pedido al backend que va a remover el tweet de la base de datos. (Fijate que enviar un HTTP DELETE de un HTTP form no es posible usando lo que sabemos hoy. Vas a necesitar enviar un POST request.)
