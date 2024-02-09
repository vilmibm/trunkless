CREATE TABLE IF NOT EXISTS phrases (
  id       INTEGER PRIMARY KEY,
  sourceid INTEGER,
  phrase   TEXT UNIQUE,

  FOREIGN KEY (sourceid) REFERENCES sources(sourceid)
);

CREATE TABLE IF NOT EXISTS sources (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE
);
