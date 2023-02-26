CREATE TABLE messages (
  id SMALLINT AUTO INCREMENT PRIMARY KEY,
  sender VARCHAR (255),
  recepient VARCHAR (255),
  image VARCHAR (255),
  message TEXT,
  has_read BOOLEAN
);
