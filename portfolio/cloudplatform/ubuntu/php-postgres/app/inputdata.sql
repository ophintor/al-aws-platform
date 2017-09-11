CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  task varchar (50) NOT NULL,
  taskdate date NOT NULL,
  tasktime time NOT NULL
);

ALTER SEQUENCE tasks_id_seq RESTART WITH 3;
--
-- Dumping data for table `tasks`
--
INSERT INTO tasks (id, task, taskdate, tasktime) VALUES (1, 'Build to-do list app', '2014-10-23', '04:02:31');
INSERT INTO tasks (id, task, taskdate, tasktime) VALUES (2, 'Add to-do items', '2014-10-28', '16:21:12');
