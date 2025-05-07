CREATE TABLE `tournaments` (
  `id` integer PRIMARY KEY,
  `orga_id` integer NOT NULL,
  `created_at` timestamp
);

CREATE TABLE `users` (
  `id` integer PRIMARY KEY,
  `username` varchar(255),
  `email` varchar(255),
  `password` varchar(255),
  `pbw_pin` varchar(255),
  `created_at` timestamp
);

CREATE TABLE `game` (
  `id` integer PRIMARY KEY,
  `player1` integer NOT NULL,
  `player2` integer NOT NULL,
  `tournament_id` integer,
  `score1` integer,
  `score2` integer,
  `created_at` timestamp
);

CREATE TABLE `tournament_user` (
  `id` integer PRIMARY KEY,
  `user_id` integer NOT NULL,
  `tournament_id` integer NOT NULL,
  `faction` varchar(255)
);

ALTER TABLE `tournaments` ADD FOREIGN KEY (`orga_id`) REFERENCES `users` (`id`);

ALTER TABLE `game` ADD FOREIGN KEY (`player1`) REFERENCES `users` (`id`);

ALTER TABLE `game` ADD FOREIGN KEY (`player2`) REFERENCES `users` (`id`);

ALTER TABLE `game` ADD FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`id`);

ALTER TABLE `tournament_user` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `tournament_user` ADD FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`id`);
