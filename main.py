"""
CRUD Operations - It stands for Create, Read, Update and Delete Operations
In the terms of API :-

Create (C) - We use POST method
Read (R) - We use GET method
Update (U) - We use PUT/PATCH method
Delete (D) - We use DELETE method

Difference between PUT and PATCH:
- PUT: If you want to modify any thing in API so you have to pass every item in the PUT. Replaces the entire resource with the new data. If any field is missing in the request, it will be removed from the resource.
- PATCH: Partially updates the resource. Only the fields provided in the request will be updated, and the rest will remain unchanged.

"""

from fastapi import FastAPI
from pydantic import BaseModel # used for defining a schema just to force user what is expected
from typing import Optional # This is used to pass the any field/data which we want to keep as an optional data like not necessary to send it

app = FastAPI()

# So what we do is we extend Basemodel into our Post class and then we define how we are going to use and what is going to be a datatype of the class
class Post(BaseModel):
    title: str
    content: str
    # So till here we have setted the field we want to that should be passed when passing the parameters in the api. So now we want to send a data which may be an Optional data 
    caption:  Optional[str] = None

TOATL_POST = [{"id":1, "title":"First Pic","content":"My First Pic"}, {"id":2,"title":"Second Pic","content":"My Second Pic"}]

@app.get("/") # A Decorator '@' -> So this the part from where a simple function converts into a Path Operation (Language of FastAPI) or Routes. 
def root():
    # return {"message":"Hello World!"}
    return {'message':'Hello World'} # We are returning a dictionary and FastAPI will automatically convert it to Json

@app.post("/posts")
def send_posts(payload: Post): # payload: Post here we mean that our payload is going to have everything what's into the Post class which agian is made via pydantic via which we have fixed a schema so title and content are mandotry to pass and caption is optional we might pass it we might not pass it.
    
    # So Generally what happens is that this payload has the data in it in the form of pydantic model. So we can convert it from a pydantic model to a python dict by using .dict
    print(payload.dict())
    print("payload.title: ",payload.title)
    print("payload.content",payload.content)
    return {f"message":payload}
