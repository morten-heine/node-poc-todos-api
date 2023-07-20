CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    done BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX idx_todos_done ON todos(done);

CREATE TABLE TodoComments (
    id SERIAL PRIMARY KEY,
    comment TEXT NOT NULL,
    todo_id INTEGER,
    FOREIGN KEY (todo_id) REFERENCES Todos(id)
);
