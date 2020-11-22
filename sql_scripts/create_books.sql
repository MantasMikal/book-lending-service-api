CREATE TABLE books (
      ID INT NOT NULL AUTO_INCREMENT,  
      title VARCHAR(32) NOT NULL,
      summary TEXT,
      author TEXT NOT NULL,
      yearPublished VARCHAR(5) NOT NULL,
      ISBN TEXT,
      images VARCHAR(2048),
      ownerID INT NOT NULL,
      borrowerId INT,
      requesterId INT,
      dateCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
      dateModified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (ID),
      FOREIGN KEY (ownerID) REFERENCES users (ID) ON DELETE CASCADE,
      FOREIGN KEY (borrowerID) REFERENCES users (ID) ON DELETE CASCADE,
      FOREIGN KEY (requesterID) REFERENCES users (ID) ON DELETE CASCADE
);

INSERT INTO books (title, summary, author, yearPublished, ownerID) VALUES ('Book', 'A summray', 'Mantas', '2019', 1);