CREATE TABLE `tournaments` (
  `id` varchar(255) PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `orga_id` varchar(255) NOT NULL,
  `ended` bool NOT NULL,
  `created_at` timestamp
);

CREATE TABLE `users` (
  `id` varchar(255) PRIMARY KEY,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `pbw_pin` varchar(255),
  `created_at` timestamp
);

CREATE TABLE `game` (
  `id` varchar(255) PRIMARY KEY,
  `player1` varchar(255) NOT NULL,
  `player2` varchar(255) NOT NULL,
  `tournament_id` varchar(255),
  `round_nr` integer,
  `score1` integer NOT NULL,
  `score2` integer NOT NULL,
  `ended` bool NOT NULL,
  `created_at` timestamp
);

CREATE TABLE `tournament_user` (
  `id` int PRIMARY KEY,
  `user_id` varchar(255) NOT NULL,
  `tournament_id` varchar(255) NOT NULL,
  `faction` varchar(255) NOT NULL
);

ALTER TABLE `tournaments` ADD FOREIGN KEY (`orga_id`) REFERENCES `users` (`id`);

ALTER TABLE `game` ADD FOREIGN KEY (`player1`) REFERENCES `users` (`id`);

ALTER TABLE `game` ADD FOREIGN KEY (`player2`) REFERENCES `users` (`id`);

ALTER TABLE `game` ADD FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`id`);

ALTER TABLE `tournament_user` ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `tournament_user` ADD FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`id`);
