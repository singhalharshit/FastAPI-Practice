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
from sre_constants import SUCCESS
from fastapi import Body, FastAPI,Response,status,HTTPException
from pydantic import BaseModel # used for defining a schema just to force user what is expected
from typing import Optional # This is used to pass the any field/data which we want to keep as an optional data like not necessary to send it
from random import randint

# So what we do is we extend Basemodel into our Post class and then we define how we are going to use and what is going to be a datatype of the class
class Post(BaseModel):
    title: str
    content: str
    # So till here we have setted the field we want to that should be passed when passing the parameters in the api. So now we want to send a data which may be an Optional data 
    caption:  Optional[str] = None

def find_post(id):
    for i in TOTAL_POST:
        if i['id'] == int(id):
            return i

def find_index_of_posts(id):
    for i, p in enumerate(TOTAL_POST):
        if p['id']==int(id):
            return i

app = FastAPI()

TOTAL_POST = [{"id":1, "title":"First Pic","content":"My First Pic"}, {"id":2,"title":"Second Pic","content":"My Second Pic"}]

@app.get("/") # A Decorator '@' -> So this the part from where a simple function converts into a Path Operation (Language of FastAPI) or Routes. 
def root():
    # return {"message":"Hello World!"}
    return {'message':'Hello World'} # We are returning a dictionary and FastAPI will automatically convert it to Json

@app.get("/total_post")
def get_total_post():
    return {"Total_Posts":TOTAL_POST}

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


# @app.get("/post/{id}") #Here {id} or anything inside {} is called path parameter
# def get_post(id:int,response:Response):
#     post_finding= find_post(id)
#     if not post_finding:
#         response.status_code = status.HTTP_404_NOT_FOUND
#         # return {"detail": f"Post with id {id} not found"}
#         raise HTTPException(status_code=404, detail=f"Post with id {id} not found") # So this is the part where we are handling the issue that if someone passes id not in our db or in this case local variable so we can handle it
#     print(id)
#     return {"Post_Details": post_finding}


#So what we did above is refined and told below which is that if any of the id is not in the local variable it will handled by the HTTPException so we don't need response and all
@app.get("/post/{id}") #Here {id} or anything inside {} is called path parameter
def get_post(id:int,response:Response):
    post_finding= find_post(id)
    if not post_finding:
        raise HTTPException(status_code=404, detail=f"Post with id {id} not found") # So this is the part where we are handling the issue that if someone passes id not in our db or in this case local variable so we can handle it
    print(id)
    return {"Post_Details": post_finding}

# Deleting a post

@app.delete("/delete/{id}",status_code=status.HTTP_204_NO_CONTENT)
def delete_post(id:int):
    post_to_be_deleted = find_index_of_posts(id)
    TOTAL_POST.pop(post_to_be_deleted) 
    return {"Message":"SUCCESS"}

# After this we can see that yes one of the post has been deleted from the Variable TOTAL_POST. We can Verify it from /total_post line 49
    

# Updating any post using PUT method - Remember into PUT method we have to pass in every field unlike PATCH

@app.put("/updating_post/{id}")
def updating_posts(id:int, post:Post):
    post_to_be_updated = find_index_of_posts(id)
    post_dict = post.dict()

# Interaction with SQL Database - ORM Or a normal library 
    """
        Object Relational Mapper - It is a layer of abstraction that sits between the database and us. 
        So instead of using RAW SQL directly we use the functions of the ORM and the ORM communicates to SQL using our python code. 
        This is to remove SQL complexity and use a simple basic functions
    """

# Difference between Schema/Pydantic model and SQL Alchemy Model
    """
        Schema/Pydantic model define the structure of a request & response
        This ensure that when a user wants to create a post the request will only go through if it has a "title" and "content" in the body in our case
        Where as SQL Alchemy model is used to play around with databases in order to define a proper database structure
    """