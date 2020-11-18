CREATE TABLE users (
      ID INT NOT NULL AUTO_INCREMENT,  
      role VARCHAR(16) NOT NULL DEFAULT 'user',
      username VARCHAR(16) UNIQUE NOT NULL,
      dateRegistered DATETIME DEFAULT CURRENT_TIMESTAMP,
      password VARCHAR(128) NOT NULL,  
      passwordSalt VARCHAR(16),  
      email VARCHAR(64) UNIQUE NOT NULL,
      country VARCHAR(64) NOT NULL,
      city VARCHAR(64)  NOT NULL,
      postcode VARCHAR(12) NOT NULL,
      address VARCHAR(128) NOT NULL,
      PRIMARY KEY (ID),
      FOREIGN KEY (role) REFERENCES roles (name)
);
