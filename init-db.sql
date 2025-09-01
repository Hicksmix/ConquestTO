CREATE TABLE `tournaments`
(
    `id`                     varchar(255) PRIMARY KEY,
    `name`                   varchar(255)                         NOT NULL,
    `date`                   date                                 NOT NULL,
    `orga_id`                varchar(255)                         NOT NULL,
    `state`                  ENUM ('created', 'ongoing', 'ended') NOT NULL,
    `current_round`          int,
    `current_round_state` ENUM ('created', 'ongoing', 'ended'),
    `created_at`             timestamp
);

CREATE TABLE `users`
(
    `id`         varchar(255) PRIMARY KEY,
    `username`   varchar(255) NOT NULL UNIQUE,
    `email`      varchar(255) NOT NULL UNIQUE,
    `password`   varchar(255) NOT NULL,
    `pbw_pin`    varchar(6) UNIQUE,
    `created_at` timestamp
);

CREATE TABLE `game`
(
    `id`            int PRIMARY KEY AUTO_INCREMENT,
    `player1`       varchar(255) NOT NULL,
    `player2`       varchar(255),
    `tournament_id` varchar(255),
    `round_nr`      integer,
    `score1`        integer,
    `score2`        integer,
    `ended`         bool,
    `winner_id`     varchar(255),
    `scenario`      int,
    `table_nr`      int
);

CREATE TABLE `tournament_user`
(
    `id`                      int PRIMARY KEY AUTO_INCREMENT,
    `user_id`                 varchar(255) NOT NULL,
    `tournament_id`           varchar(255) NOT NULL,
    `faction`                 varchar(20)  NOT NULL,
    `has_received_bye`        bool,
    `has_been_paired_up_down` bool,
    `team_name`               varchar(255)
);

ALTER TABLE `tournaments`
    ADD FOREIGN KEY (`orga_id`) REFERENCES `users` (`id`);

ALTER TABLE `game`
    ADD FOREIGN KEY (`player1`) REFERENCES `users` (`id`);

ALTER TABLE `game`
    ADD FOREIGN KEY (`player2`) REFERENCES `users` (`id`);

ALTER TABLE `game`
    ADD FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`id`);

ALTER TABLE `game`
    ADD FOREIGN KEY (`winner_id`) REFERENCES `users` (`id`);

ALTER TABLE `tournament_user`
    ADD FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

ALTER TABLE `tournament_user`
    ADD FOREIGN KEY (`tournament_id`) REFERENCES `tournaments` (`id`);

INSERT INTO `users` (id, username, email, password, pbw_pin, created_at)
VALUES ('4pjZnsYaJAZzdJDhCivicbZoNR5TL1QLyg1Ez3wvTsOsv1EjqjdLJVZ1uvH7lrpe', 'Hicksmix', 'nicklas@amlinger.com',
        '0fadf52a4580cfebb99e61162139af3d3a6403c1d36b83e4962b721d1c8cbd0b', 'CP9FP', '2025-06-02 10:22:41'),
       ('QTXgyUemWJREu31ObsxiiJibVYPpBRWJELi8Bokb6tRyr3PFOE3ve5vrXZgysBc0', 'Torsul', 'torsul@torsul.com',
        '0fadf52a4580cfebb99e61162139af3d3a6403c1d36b83e4962b721d1c8cbd0b', 'CP97D', '2025-06-02 10:22:41'),
       ('JF1N8fHZEVcnVJh5P7xGWqEoV7cgxdPaZYIecE5pAktRQuP6QEfjcB9psltfOSm9', 'Hanna', 'de_la_metallica@gmail.de',
        '0fadf52a4580cfebb99e61162139af3d3a6403c1d36b83e4962b721d1c8cbd0b', '994FR', '2025-06-02 10:22:41'),
       ('9bXWXuFVcGeofX1z3PcVvEyuhnzosCOCxuSnwK0IIS7p9envMxkW56TSMT0RFnKR', 'Uziel', 'UzielTjade@gmail.de',
        '0fadf52a4580cfebb99e61162139af3d3a6403c1d36b83e4962b721d1c8cbd0b', '83GHD', '2025-06-02 10:22:41'),
       ('cjX7QnCw6WRVA8pItadW34519ArL0H5kmz5QeGyWPEq67dA13ECOqx8nnILbb5ZP', 'SirGhrino',
        'mortenslangetestemailadresse@looooong.de', '0fadf52a4580cfebb99e61162139af3d3a6403c1d36b83e4962b721d1c8cbd0b',
        null, '2025-06-02 10:22:41'),
       ('x05eywtGTrmndQ0K84aGzJxJegr26dUDIZSMcDSUQWKq1HHuKVEqclCsRK1xMyGx', 'Caliduss', 'WadIgitt@para-bellum.com',
        '0fadf52a4580cfebb99e61162139af3d3a6403c1d36b83e4962b721d1c8cbd0b', 'KASR2', '2025-06-02 10:22:41'),
       ('tmNEiZUac4rj8fdul9K9IZuYVPpdRcs0ixSC2rV5jb0haG0Gn03piuiarbeNnSWc', 'Culexuss', 'cs_pls_nerf_chariots@gmail.de',
        '0fadf52a4580cfebb99e61162139af3d3a6403c1d36b83e4962b721d1c8cbd0b', null, '2025-06-02 10:22:41'),
       ('UW42nAeqQr5rbLUrbXy9KMe10BcxaaNHQxbBoWJEnQWvxMN0rw2ewIGEQYpGxxha', 'Nauth', 'kaffeetrinker3000@gmail.com',
        '0fadf52a4580cfebb99e61162139af3d3a6403c1d36b83e4962b721d1c8cbd0b', 'PORT2', '2025-06-02 10:22:41'),
       ('2oA8uz0xklQEcjDf6m3ywqbz47BPfvIewIwwrdHlb3B1zyygjQm9SRKPeFhSvgc3', 'Lenobiana', 'best@grill.com',
        '0fadf52a4580cfebb99e61162139af3d3a6403c1d36b83e4962b721d1c8cbd0b', '0S9S8', '2025-06-02 10:22:41'),
       ('kFDS8CfsJIW86OUn96LlYmBp9lNkSXMiFw7N4gBH0MAGUAuqsNKyW4tHSnSp8gKG', 'Waaghi', 'test2@test.com',
        '0fadf52a4580cfebb99e61162139af3d3a6403c1d36b83e4962b721d1c8cbd0b', 'CP8FP', '2025-06-02 10:22:41'),
       ('r88m4tfiH68AGa9pVFQLx7UZDybBHXVYUfJlzo8NipV4w5T5UHB4PYnYydunDgI4', 'Wuetty',
        'kommt_eh_nie_auf_turniere@test.de', '0fadf52a4580cfebb99e61162139af3d3a6403c1d36b83e4962b721d1c8cbd0b', null,
        '2025-06-02 10:22:41'),
       ('u8G6l99oQkZDDgF9EaalxBHC61m1JY2hRWnVhNi0SqyJCoHIbwDAnMKdamr6Ogct', 'Lemartes70', 'test@test.com',
        '0fadf52a4580cfebb99e61162139af3d3a6403c1d36b83e4962b721d1c8cbd0b', null, '2025-06-02 10:22:41'),
       ('W72ZImvG5lRi4YFJU0ceJavkWtisYA695bz2VhPByBgKYuSB7noT5DbW1EVZKzM0', 'bremer1701', 'nurKavallerie@test.com',
        '0fadf52a4580cfebb99e61162139af3d3a6403c1d36b83e4962b721d1c8cbd0b', 'C3422', '2025-06-02 10:22:41'),
       ('MEeKSHrUF7XaS3m1d4dltphev0jUX4kaBXQSqupyv3Y9L580hyJyvAcYC8S7QFIo', 'Karacho', 'karacho@test.de',
        '0fadf52a4580cfebb99e61162139af3d3a6403c1d36b83e4962b721d1c8cbd0b', 'P999P', '2025-06-02 10:22:41'),
       ('jzCkruWXIOBNAXcNx7kb6Xqjnq9Tlhjuxlp8wtQsOMNA6PQlX0ZaT1M60fyFPLjR', 'DrBear', 'wann_dweg_rework@gmail.de',
        '0fadf52a4580cfebb99e61162139af3d3a6403c1d36b83e4962b721d1c8cbd0b', 'B00B5', '2025-06-02 10:22:41'),
       ('GqtgrBTIGFuh2pATePRdNBMairZuIKrBvmRiwXtiLwt0uexjbriRKhFaqgquI5wI', 'Timperator', 'test3@test.de',
        '0fadf52a4580cfebb99e61162139af3d3a6403c1d36b83e4962b721d1c8cbd0b', 'TSARA', '2025-06-02 10:22:41'),
       ('A18NkOvE5Gx1sXMgvlEWaSA2NFojVOYTBAakcSB3K9WjWuxa6TAdJ96EQ2Ht9uAf', 'Cameron1411', 'swu_only@dennis.com',
        '0fadf52a4580cfebb99e61162139af3d3a6403c1d36b83e4962b721d1c8cbd0b', '9AEAA', '2025-06-02 10:22:41'),
       ('JL44muLH7l1oJ1w4GXYibLTsU54mxCLEJUuAr29jYS5iYuDW1Jnb48IH5fa0khaG', 'Nico', 'test52@gmail.de',
        '0fadf52a4580cfebb99e61162139af3d3a6403c1d36b83e4962b721d1c8cbd0b', '09DU7', '2025-06-02 10:22:41');

INSERT INTO `tournaments` (id, name, date, orga_id, state, current_round, current_round_state, created_at)
VALUES ('eIbSnHxZpqOichhx6pFzTBLF8hmaTggPUmjbinskLhxwFgibVxwrR7QZLwzFDhDz', 'Victorum Liubice II', '2024-01-08',
        '4pjZnsYaJAZzdJDhCivicbZoNR5TL1QLyg1Ez3wvTsOsv1EjqjdLJVZ1uvH7lrpe', 'ended', 0, 'ended', '2025-06-02 10:22:41'),
       ('WBfgC3rVDfQQPDhOJv2uZJjlqAvB05FtI83sVMb82EhpX1olbXmML2ZZGIZe1yOi', 'Victorum Liubice III', '2024-05-05',
        '4pjZnsYaJAZzdJDhCivicbZoNR5TL1QLyg1Ez3wvTsOsv1EjqjdLJVZ1uvH7lrpe', 'ended', 0, 'ended', '2025-06-02 10:22:41'),
       ('sZBkDuyWfLC7tGjyXhUppvEBAbHYI80OlXj7zqoi5av6RIIEuRKrv8VBMq3OFoD2', 'Victorum Liubice IV', '2024-09-15',
        '4pjZnsYaJAZzdJDhCivicbZoNR5TL1QLyg1Ez3wvTsOsv1EjqjdLJVZ1uvH7lrpe', 'ended', 0, 'ended', '2025-06-02 10:22:41'),
       ('4oPN58gerSQumySQvw0ap2WguOhgh7f8UcqMGEabBDd7szpxuayeinxRWmWvyYX7', 'Victorum Liubice V', '2024-11-16',
        '4pjZnsYaJAZzdJDhCivicbZoNR5TL1QLyg1Ez3wvTsOsv1EjqjdLJVZ1uvH7lrpe', 'ended', 0, 'ended', '2025-06-02 10:22:41'),
       ('C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', 'Victorum Liubice VI', '2025-04-13',
        '4pjZnsYaJAZzdJDhCivicbZoNR5TL1QLyg1Ez3wvTsOsv1EjqjdLJVZ1uvH7lrpe', 'ongoing', 2, 'ended', '2025-06-02 10:22:41'),
       ('Y8rHd7IBTEec3odkUaByzavofSV0LH3ThWIZV1tP8nd5ZTGvX4dG59C1MtRPNFBQ', 'Test Tournament Created', '2025-06-02',
        '4pjZnsYaJAZzdJDhCivicbZoNR5TL1QLyg1Ez3wvTsOsv1EjqjdLJVZ1uvH7lrpe', 'created', 0, 'ended', '2025-06-02 10:22:41'),
       ('B6k902OHoNasoDmL0kGAsylNgBPKvEOK5iSEsIeFC2jH2LLeoEpuv6HnhBdGRk3S', 'Test Tournament Ongoing', '2025-06-01',
        '4pjZnsYaJAZzdJDhCivicbZoNR5TL1QLyg1Ez3wvTsOsv1EjqjdLJVZ1uvH7lrpe', 'ongoing', 0, 'ended', '2025-06-02 10:22:41');

INSERT INTO `tournament_user` (id, user_id, tournament_id, faction)
VALUES (1, 'QTXgyUemWJREu31ObsxiiJibVYPpBRWJELi8Bokb6tRyr3PFOE3ve5vrXZgysBc0',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', 'old_dominion'),
       (2, 'JF1N8fHZEVcnVJh5P7xGWqEoV7cgxdPaZYIecE5pAktRQuP6QEfjcB9psltfOSm9',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', '100K'),
       (3, '9bXWXuFVcGeofX1z3PcVvEyuhnzosCOCxuSnwK0IIS7p9envMxkW56TSMT0RFnKR',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', 'nords'),
       (4, 'cjX7QnCw6WRVA8pItadW34519ArL0H5kmz5QeGyWPEq67dA13ECOqx8nnILbb5ZP',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', 'nords'),
       (5, 'x05eywtGTrmndQ0K84aGzJxJegr26dUDIZSMcDSUQWKq1HHuKVEqclCsRK1xMyGx',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', 'wadrhun'),
       (6, 'tmNEiZUac4rj8fdul9K9IZuYVPpdRcs0ixSC2rV5jb0haG0Gn03piuiarbeNnSWc',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', 'city_states'),
       (7, 'UW42nAeqQr5rbLUrbXy9KMe10BcxaaNHQxbBoWJEnQWvxMN0rw2ewIGEQYpGxxha',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', 'spires'),
       (8, '2oA8uz0xklQEcjDf6m3ywqbz47BPfvIewIwwrdHlb3B1zyygjQm9SRKPeFhSvgc3',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', 'old_dominion'),
       (9, 'kFDS8CfsJIW86OUn96LlYmBp9lNkSXMiFw7N4gBH0MAGUAuqsNKyW4tHSnSp8gKG',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', 'spires'),
       (10, 'r88m4tfiH68AGa9pVFQLx7UZDybBHXVYUfJlzo8NipV4w5T5UHB4PYnYydunDgI4',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', 'sorcerer_kings'),
       (11, 'u8G6l99oQkZDDgF9EaalxBHC61m1JY2hRWnVhNi0SqyJCoHIbwDAnMKdamr6Ogct',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', 'dweghom'),
       (12, 'W72ZImvG5lRi4YFJU0ceJavkWtisYA695bz2VhPByBgKYuSB7noT5DbW1EVZKzM0',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', '100K'),
       (13, 'MEeKSHrUF7XaS3m1d4dltphev0jUX4kaBXQSqupyv3Y9L580hyJyvAcYC8S7QFIo',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', 'yoroni'),
       (14, 'jzCkruWXIOBNAXcNx7kb6Xqjnq9Tlhjuxlp8wtQsOMNA6PQlX0ZaT1M60fyFPLjR',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', 'dweghom'),
       (15, 'GqtgrBTIGFuh2pATePRdNBMairZuIKrBvmRiwXtiLwt0uexjbriRKhFaqgquI5wI',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', 'dweghom'),
       (16, 'JL44muLH7l1oJ1w4GXYibLTsU54mxCLEJUuAr29jYS5iYuDW1Jnb48IH5fa0khaG',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', 'nords');

INSERT INTO `game` (`id`, `player1`, `player2`, `tournament_id`, `round_nr`, `score1`, `score2`, `ended`, `winner_id`,
                    `scenario`, `table_nr`)
VALUES (1, 'QTXgyUemWJREu31ObsxiiJibVYPpBRWJELi8Bokb6tRyr3PFOE3ve5vrXZgysBc0',
        'JF1N8fHZEVcnVJh5P7xGWqEoV7cgxdPaZYIecE5pAktRQuP6QEfjcB9psltfOSm9',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', 1, 29, 28, 1,
        'QTXgyUemWJREu31ObsxiiJibVYPpBRWJELi8Bokb6tRyr3PFOE3ve5vrXZgysBc0', 5, 1),
       (2, '9bXWXuFVcGeofX1z3PcVvEyuhnzosCOCxuSnwK0IIS7p9envMxkW56TSMT0RFnKR',
        'cjX7QnCw6WRVA8pItadW34519ArL0H5kmz5QeGyWPEq67dA13ECOqx8nnILbb5ZP',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', 1, 22, 23, 1,
        'cjX7QnCw6WRVA8pItadW34519ArL0H5kmz5QeGyWPEq67dA13ECOqx8nnILbb5ZP', 5, 2),
       (3, 'x05eywtGTrmndQ0K84aGzJxJegr26dUDIZSMcDSUQWKq1HHuKVEqclCsRK1xMyGx',
        'tmNEiZUac4rj8fdul9K9IZuYVPpdRcs0ixSC2rV5jb0haG0Gn03piuiarbeNnSWc',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', 1, 17, 11, 1,
        'x05eywtGTrmndQ0K84aGzJxJegr26dUDIZSMcDSUQWKq1HHuKVEqclCsRK1xMyGx', 5, 3),
       (4, 'UW42nAeqQr5rbLUrbXy9KMe10BcxaaNHQxbBoWJEnQWvxMN0rw2ewIGEQYpGxxha',
        '2oA8uz0xklQEcjDf6m3ywqbz47BPfvIewIwwrdHlb3B1zyygjQm9SRKPeFhSvgc3',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', 1, 29, 10, 1,
        'UW42nAeqQr5rbLUrbXy9KMe10BcxaaNHQxbBoWJEnQWvxMN0rw2ewIGEQYpGxxha', 5, 4),
       (5, 'kFDS8CfsJIW86OUn96LlYmBp9lNkSXMiFw7N4gBH0MAGUAuqsNKyW4tHSnSp8gKG',
        'r88m4tfiH68AGa9pVFQLx7UZDybBHXVYUfJlzo8NipV4w5T5UHB4PYnYydunDgI4',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', 1, 17, 28, 1,
        'r88m4tfiH68AGa9pVFQLx7UZDybBHXVYUfJlzo8NipV4w5T5UHB4PYnYydunDgI4', 5, 5),
       (6, 'u8G6l99oQkZDDgF9EaalxBHC61m1JY2hRWnVhNi0SqyJCoHIbwDAnMKdamr6Ogct',
        'W72ZImvG5lRi4YFJU0ceJavkWtisYA695bz2VhPByBgKYuSB7noT5DbW1EVZKzM0',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', 1, 2, 19, 1,
        'W72ZImvG5lRi4YFJU0ceJavkWtisYA695bz2VhPByBgKYuSB7noT5DbW1EVZKzM0', 5, 6),
       (7, 'MEeKSHrUF7XaS3m1d4dltphev0jUX4kaBXQSqupyv3Y9L580hyJyvAcYC8S7QFIo',
        'jzCkruWXIOBNAXcNx7kb6Xqjnq9Tlhjuxlp8wtQsOMNA6PQlX0ZaT1M60fyFPLjR',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', 1, 17, 10, 1,
        'MEeKSHrUF7XaS3m1d4dltphev0jUX4kaBXQSqupyv3Y9L580hyJyvAcYC8S7QFIo', 5, 7),
       (8, 'GqtgrBTIGFuh2pATePRdNBMairZuIKrBvmRiwXtiLwt0uexjbriRKhFaqgquI5wI',
        'JL44muLH7l1oJ1w4GXYibLTsU54mxCLEJUuAr29jYS5iYuDW1Jnb48IH5fa0khaG',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', 1, 17, 28, 1,
        'JL44muLH7l1oJ1w4GXYibLTsU54mxCLEJUuAr29jYS5iYuDW1Jnb48IH5fa0khaG', 5, 8),
       (9, 'GqtgrBTIGFuh2pATePRdNBMairZuIKrBvmRiwXtiLwt0uexjbriRKhFaqgquI5wI',
        'jzCkruWXIOBNAXcNx7kb6Xqjnq9Tlhjuxlp8wtQsOMNA6PQlX0ZaT1M60fyFPLjR',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', 2, 12, 10, 1,
        'GqtgrBTIGFuh2pATePRdNBMairZuIKrBvmRiwXtiLwt0uexjbriRKhFaqgquI5wI', 0, 1),
       (10, 'QTXgyUemWJREu31ObsxiiJibVYPpBRWJELi8Bokb6tRyr3PFOE3ve5vrXZgysBc0',
        'r88m4tfiH68AGa9pVFQLx7UZDybBHXVYUfJlzo8NipV4w5T5UHB4PYnYydunDgI4',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', 2, 4, 40, 1,
        'r88m4tfiH68AGa9pVFQLx7UZDybBHXVYUfJlzo8NipV4w5T5UHB4PYnYydunDgI4', 0, 2),
       (11, '2oA8uz0xklQEcjDf6m3ywqbz47BPfvIewIwwrdHlb3B1zyygjQm9SRKPeFhSvgc3',
        'kFDS8CfsJIW86OUn96LlYmBp9lNkSXMiFw7N4gBH0MAGUAuqsNKyW4tHSnSp8gKG',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', 2, 0, 0, 1, NULL, 0, 3),
       (12, 'MEeKSHrUF7XaS3m1d4dltphev0jUX4kaBXQSqupyv3Y9L580hyJyvAcYC8S7QFIo',
        'x05eywtGTrmndQ0K84aGzJxJegr26dUDIZSMcDSUQWKq1HHuKVEqclCsRK1xMyGx',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', 2, 10, 20, 1,
        'x05eywtGTrmndQ0K84aGzJxJegr26dUDIZSMcDSUQWKq1HHuKVEqclCsRK1xMyGx', 0, 4),
       (13, 'cjX7QnCw6WRVA8pItadW34519ArL0H5kmz5QeGyWPEq67dA13ECOqx8nnILbb5ZP',
        'W72ZImvG5lRi4YFJU0ceJavkWtisYA695bz2VhPByBgKYuSB7noT5DbW1EVZKzM0',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', 2, 40, 2, 1,
        'cjX7QnCw6WRVA8pItadW34519ArL0H5kmz5QeGyWPEq67dA13ECOqx8nnILbb5ZP', 0, 5),
       (14, 'JL44muLH7l1oJ1w4GXYibLTsU54mxCLEJUuAr29jYS5iYuDW1Jnb48IH5fa0khaG',
        'UW42nAeqQr5rbLUrbXy9KMe10BcxaaNHQxbBoWJEnQWvxMN0rw2ewIGEQYpGxxha',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', 2, 10, 12, 1,
        'UW42nAeqQr5rbLUrbXy9KMe10BcxaaNHQxbBoWJEnQWvxMN0rw2ewIGEQYpGxxha', 0, 6),
       (15, 'JF1N8fHZEVcnVJh5P7xGWqEoV7cgxdPaZYIecE5pAktRQuP6QEfjcB9psltfOSm9',
        '9bXWXuFVcGeofX1z3PcVvEyuhnzosCOCxuSnwK0IIS7p9envMxkW56TSMT0RFnKR',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', 2, 1, 24, 1,
        '9bXWXuFVcGeofX1z3PcVvEyuhnzosCOCxuSnwK0IIS7p9envMxkW56TSMT0RFnKR', 0, 7),
       (16, 'u8G6l99oQkZDDgF9EaalxBHC61m1JY2hRWnVhNi0SqyJCoHIbwDAnMKdamr6Ogct',
        'tmNEiZUac4rj8fdul9K9IZuYVPpdRcs0ixSC2rV5jb0haG0Gn03piuiarbeNnSWc',
        'C9Y8wreXgrgIat5ssQZfDTycgzALzVX4vLZkCLJaFWH6bpagrC8tIxgEmfQ4rbHJ', 2, 2, 5, 1,
        'tmNEiZUac4rj8fdul9K9IZuYVPpdRcs0ixSC2rV5jb0haG0Gn03piuiarbeNnSWc', 0, 8);
