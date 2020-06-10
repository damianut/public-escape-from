Escape From game.

Partially created game.
The player's movement controlling is described in point .4.
Explore the game world and enjoy the eyes with beautiful graphics!

.1. Requirements:
  .a. Symfony
  .b. Composer
  .c. MySQL server
  .d. mail account to automatic sending e-mails for players
      (for example Gmail with less secure apps enabled)
  .e. browser (this site was tested in Google Chrome)

.2. Installation:
  .a. Clone damianut/escape-from repo from GitHub.
  .b. Download and install vendors in cloned repo.
      $ cd <cloned-main-repo-dir>
      $ composer install
  .d. Run MySQL server if it isn't running.
  .e. Create empty `_escape_from_` database in MySQL. Then create user
      ('escaper'@'localhost' for example) with password and grant him all
      privileges on `_escape_from_`.*
  .f. Configure MySQL server version in `config/packages/doctrine.yaml`.
  .g. Create DATABASE_URL variable in `.env.local` file according to your data
      (mysql username and password, localhost and port) and remove
      DATABASE_URL from `.env`
  .h. If your data provided in above variable contains reserved character(s)
      defined in RFC 3986 see following site: 
      https://symfony.com/doc/current/doctrine.html#configuring-the-database
  .i. Import tables from `mysql/_escape_from_.sql` file.
  .j. Create MAILER_URL variable in `.env.local` file according to your data
      (e-mail and password). For Gmail as delivery server a variable has
      following format:
      `gmail://username:password@localhost`
  .k. The point `.h` applies accordingly to MAILER_URL variable.

.3. Running and testing:
  .a. Run Symfony Local Web Server
      $ cd <cloned-repo-dir>
      $ sudo symfony serve // Server default listening 8000 port
  .b. Go to `http://localhost:<your-port>/`, where '<your-port> is
      the port that is listening by Symfony server and check, that site works.
  .c. Try to create account, log in account and reset password. In this purpose
      go to `http://localhost:8000/` (if your port is 8000), fill forms and
      send requests.
      
.4. Player control:
  Walking in straight lines:   w s a d 
  Walking diagonally:          q e z c
  Rotating in place:           W S A D (press CAPS LOCK and w, s, a, d)
/*............................................................................*/