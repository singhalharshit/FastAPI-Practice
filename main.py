"""
CRUD Operations - It stands for Create, Read, Update and Delete Operations
In the terms of API :-

Create (C) - We use POST method
Read (R) - We use GET method
Update (U) - We use PUT/PATCH method
Delete (D) - We use DELETE method

Difference between PUT and PATCH:
- PUT: If you want to modify any thing in API so you have to pass every item in the PUT. Like if you want to change title for any post then one needs to pass a new title with every other parameter required in API
- PATCH: Partially updates the resource. Only the fields provided in the request will be updated, and the rest will remain unchanged.

"""

import re
from fastapi import Body, FastAPI
from pydantic import BaseModel # used for defining a schema just to force user what is expected
from typing import Optional,Dict # This is used to pass the any field/data which we want to keep as an optional data like not necessary to send it
from random import randint

app = FastAPI()

# So what we do is we extend Basemodel into our Post class and then we define how we are going to use and what is going to be a datatype of the class
class Post(BaseModel):
    title: str
    content: str
    # So till here we have setted the field we want to that should be passed when passing the parameters in the api. So now we want to send a data which may be an Optional data 
    caption:  Optional[str] = None

TOTAL_POST = [{"id":1, "title":"First Pic","content":"My First Pic"}, {"id":2,"title":"Second Pic","content":"My Second Pic"}]

@app.get("/") # A Decorator '@' -> So this the part from where a simple function converts into a Path Operation (Language of FastAPI) or Routes. 
def root():
    # return {"message":"Hello World!"}
    return {'message':'Hello World'} # We are returning a dictionary and FastAPI will automatically convert it to Json

@app.post("/create_post")
def create_posts(payload:dict = Body(...)): # So what we did in here was we extracted the content of the body being passed via post from the api converted it into dict format and then stored it into payload variable
    print(payload)
    return {"message":"Successful"}


@app.post("/posts")
def send_posts( new_payload: Post): # payload: Post here we mean that our payload is going to have everything what's into the Post class which again is made via pydantic via which we have fixed a schema so title and content are mandatory to pass and caption is optional we might pass it we might not pass it.
    
    # So Generally what happens is that this payload has the data in it in the form of pydantic model. So we can convert it from a pydantic model to a python dict by using .dict
    print(new_payload.dict())
    print("payload.title: ",new_payload.title)
    print("payload.content",new_payload.content)
    return {f"message":new_payload}


@app.get("/return_post")
def return_post():
    return {"total_post":TOTAL_POST}

@app.post("/new_post")
def new_post(new_post_payload: Post):
    new_post_data = {
        "id": randint(0, 100),
        "title": new_post_payload.title,
        "content": new_post_payload.content,
        "caption": new_post_payload.caption
    }
    TOTAL_POST.append(new_post_data)
    print(TOTAL_POST)
    return{"Your New Post meta data":new_post_payload}

def find_post(id):
    for i in TOTAL_POST:
        if i['id'] == int(id):
            return i

@app.get("/post/{id}") #Here {id} or anything inside {} is called path parameter
def get_post(id:int):
    post_finding= find_post(id)
    print(id)
    return {"Post_Details": post_finding}

