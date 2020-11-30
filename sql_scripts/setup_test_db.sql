SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE roles (
  name VARCHAR(16) UNIQUE NOT NULL,
  description TEXT,
  PRIMARY KEY (name)
);

INSERT INTO roles (name, description) VALUES ('user', 'Default user role');

CREATE TABLE users (
      ID INT NOT NULL AUTO_INCREMENT,  
      role VARCHAR(16) NOT NULL DEFAULT 'user',
      username VARCHAR(16) UNIQUE NOT NULL,
      fullName VARCHAR(128) NOT NULL,
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

CREATE TABLE requests (
      ID INT NOT NULL AUTO_INCREMENT,
      title VARCHAR(128) NOT NULL,
      requesterID INT NOT NULL,
      bookID INT NOT NULL,
      bookOwnerID INT NOT NULL,
      isArchivedByRequester BOOL DEFAULT 0,
      isArchivedByReceiver BOOL DEFAULT 0,
      dateCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
      dateModified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      status VARCHAR(128) DEFAULT 'Open',
      PRIMARY KEY (ID),
      FOREIGN KEY (requesterID) REFERENCES users (ID) ON DELETE CASCADE,
      FOREIGN KEY (bookOwnerID) REFERENCES users (ID) ON DELETE CASCADE,
      FOREIGN KEY (bookID) REFERENCES books (ID) ON DELETE CASCADE
);

CREATE TABLE messages (
      ID INT NOT NULL AUTO_INCREMENT,  
      message TEXT,
      senderID INT NOT NULL,
      receiverID INT NOT NULL,
      requestID INT NOT NULL,
      dateCreated DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (ID),
      FOREIGN KEY (senderID) REFERENCES users (ID) ON DELETE CASCADE,
      FOREIGN KEY (receiverID) REFERENCES users (ID) ON DELETE CASCADE,
      FOREIGN KEY (requestID) REFERENCES requests (ID) ON DELETE CASCADE
);

ALTER TABLE books
  ADD CONSTRAINT requestID_fk FOREIGN KEY (requestID) 
  REFERENCES requests (ID) ON DELETE CASCADE;

INSERT INTO users (username, fullName, password, email, country, city, postcode, address) VALUES ('user1', 'User 1', '$2b$10$o8or.rOS9bAzz.Dd7Hbli.KTXh1P/ZRZSaff0tA7fBdocgjjsSXh6', 'user1@user.com', 'Country', 'City', 'Postcode', 'Address');
INSERT INTO users (username, fullName, password, email, country, city, postcode, address) VALUES ('user2', 'User 2', '$2b$10$o8or.rOS9bAzz.Dd7Hbli.KTXh1P/ZRZSaff0tA7fBdocgjjsSXh6', 'user2@user.com', 'Country', 'City', 'Postcode', 'Address');
INSERT INTO users (username, fullName, password, email, country, city, postcode, address) VALUES ('user3', 'User 3', '$2b$10$o8or.rOS9bAzz.Dd7Hbli.KTXh1P/ZRZSaff0tA7fBdocgjjsSXh6', 'user3@user.com', 'Country', 'City', 'Postcode', 'Address');

INSERT INTO books (title, summary, author, yearPublished, ownerID) VALUES ('Lorem', 'A summray', 'Mantas', '2019', 1);
INSERT INTO books (title, summary, author, yearPublished, ownerID) VALUES ('Ipsum', 'A summray', 'Mantas', '2019', 1);

INSERT INTO requests(title, requesterID, bookID, bookOwnerID) VALUES ('Request title', 2, 1, 1);
INSERT INTO requests(title, requesterID, bookID, bookOwnerID, status) VALUES ('Request title', 2, 1, 1, 'Completed');

INSERT INTO messages(message, senderID, receiverID, requestID) VALUES ('Mock message', 1, 2, 1);

SET FOREIGN_KEY_CHECKS = 1;