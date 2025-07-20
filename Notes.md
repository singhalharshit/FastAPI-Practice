## Notes 

#### How does an API works?

- So an API has 3 parts WebServer -> SGI -> API Code. So what happens is that any requests which comes via web server is processed by this SGI (Server Gateway Interface) into API code depending on the language (in our case Python). Which when gets the output from API code is translated back to Web Server form via SGI.

- SGI - It is a protocol which stands for Server Gateway Interface

- In Python we have two kinds of SGI 1. Web Server Gateway Interface (WSGI). 2. Asynchronous Server Gateway Interface (ASGI)


#### Flask vs FastAPI

* Flask uses WSGI - Web Server Gateway Interface where as FastAPI uses ASGI - Asynchronous Server Gateway Interface
* Since Flask uses WSGI it is synchronous and not so scalable which is why FAST API was introduced. 
* WSGI used by Flask uses Werkzueg and FastAPI ASGI uses Starlette.
* ASGI can process multiple requests in one go since it is Asynchronous. 
* FastAPI uses Uvicorn as a Webserver and in Flask it was Gunicorn. Uvicorn is also Async and can process multiple requests in one go. 
* FastAPI can also use aysnc and await feature into it.
 
