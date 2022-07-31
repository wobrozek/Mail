# Getting Started
### How to run this project 
1. Make sure that you have already installed python or download python from here: https://www.python.org/downloads/
2. Make sure that you have already installed django or download django using comand bellow:
```console
python -m pip install Django
```
3. Next download and run my code by using this comands.
```console
git clone https://github.com/wobrozek/Mail 
cd mail
cd mail
python manage.py makemigrations mail
python manage.py migrate
python manage.py runserver
```
 Note that the emails you’ll be sending and receiving using this project will be entirely stored in your database (they won’t actually be sent to real email servers)

