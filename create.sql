CREATE TABLE users (
  username VARCHAR(255) PRIMARY KEY,
  plate VARCHAR(255),
  make VARCHAR(255),
  model VARCHAR(255),
  color VARCHAR(255)
);

CREATE TABLE apartment (
  apartment_number VARCHAR(255) PRIMARY KEY,
  visitor_code VARCHAR(255)
);
