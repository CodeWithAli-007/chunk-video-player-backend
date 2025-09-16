CREATE TABLE videos (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  filename VARCHAR(255) NOT NULL,
  uploaded_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
