CREATE TABLE roles (
  name VARCHAR(16) UNIQUE NOT NULL,
  description TEXT,
  PRIMARY KEY (name)
);
