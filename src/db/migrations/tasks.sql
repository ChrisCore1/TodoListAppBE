CREATE TABLE IF NOT EXISTS tasks (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status BOOLEAN DEFAULT FALSE,
    category_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
