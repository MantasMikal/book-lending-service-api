CREATE TABLE requests (
      ID INT NOT NULL AUTO_INCREMENT,
      title VARCHAR(128) NOT NULL,
      requesterID INT NOT NULL,
      bookID INT NOT NULL,
      bookOwnerID INT NOT NULL,
      dateCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
      dateModified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      status VARCHAR(128) DEFAULT 'Open',
      PRIMARY KEY (ID),
      FOREIGN KEY (requesterID) REFERENCES users (ID) ON DELETE CASCADE,
      FOREIGN KEY (bookOwnerID) REFERENCES users (ID) ON DELETE CASCADE,
      FOREIGN KEY (bookID) REFERENCES books (ID) ON DELETE CASCADE
);

-- SET FOREIGN_KEY_CHECKS = 1;
-- SET FOREIGN_KEY_CHECKS = 0;