There should be .env file in root with DB connection properties, e.g.

// local

db_host_a=localhost
db_port_a=5433
db_user_a=postgres
db_password_a=password
db_database_a=todos

api_listen_port_a=3500
api_host_a=localhost

See package.json for different variants of starting the server for different environments.