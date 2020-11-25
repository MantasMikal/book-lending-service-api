CREATE TABLE books (
      ID INT NOT NULL AUTO_INCREMENT,  
      title VARCHAR(32) NOT NULL,
      summary TEXT,
      author TEXT NOT NULL,
      yearPublished VARCHAR(5) NOT NULL,
      ISBN TEXT,
      images VARCHAR(2048),
      ownerID INT NOT NULL,
      requestID INT,
      status VARCHAR(32) DEFAULT 'Available',
      dateCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
      dateModified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (ID),
      FOREIGN KEY (ownerID) REFERENCES users (ID) ON DELETE CASCADE
);