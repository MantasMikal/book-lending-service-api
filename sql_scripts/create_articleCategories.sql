CREATE TABLE articleCategories (
  articleID INT NOT NULL,
  categoryID INT NOT NULL,
  FOREIGN KEY (articleID) REFERENCES articles (ID) ON DELETE CASCADE,
  FOREIGN KEY (categoryID) REFERENCES categories (ID) ON DELETE CASCADE,
  PRIMARY KEY (articleID, categoryID)
);
