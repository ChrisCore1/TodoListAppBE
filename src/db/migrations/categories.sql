CREATE TABLE IF NOT EXISTS categories(
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    user_id CHAR(36) NOT NULL,
    UNIQUE(name, user_id),
    FOREIGN KEY(user_id) REFERENCES users(id) on DELETE CASCADE
);
