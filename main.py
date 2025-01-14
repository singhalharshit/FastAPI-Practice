from fastapi import FastAPI
from pydantic import BaseModel # used for defining a schema just to force user what is expected
from typing import Optional # This is used to pass the any field/data which we want to keep as an optional data like not necessary to send it

app = FastAPI()

# So what we do is we extend Basemodel into our Post class and then we define how we are going to use and what is going to be a datatype of the class
class Post(BaseModel):
    title: str
    content: str
    # So till here we have setted the field we want to that should be passed when passing the parameters in the api. So now we want to send a data which may be an Optional data 
    not_so_important_data = Optional[str] 

@app.get("/")
def root():
    # return {"message":"Hello World!"}
    return {'message':'Hello World'}

@app.post("/post")
def send_posts(payload: Post):
    print("payload.title: ",payload.title)
    print("payload.content",payload.content)
    return {f"message":payload}