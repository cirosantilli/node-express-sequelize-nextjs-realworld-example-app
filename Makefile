db:
	psql --host=mateacademy-database-development.cqw7zu22pde8.eu-central-1.rds.amazonaws.com --port=5432 --user=realworld_next_user --password --dbname=realworld_next

up:
	pm2 start npm -- run start-prod