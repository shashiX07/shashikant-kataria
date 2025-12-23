---
title: "Building a Full Stack App with React and FastAPI"
description: "Learn how to build a modern full-stack application using React for the frontend and FastAPI for the backend. Complete with authentication, database integration, and deployment."
date: "2024-12-08"
author: "Shashikant Kataria"
tags: ["React", "FastAPI", "Full Stack", "Python", "Tutorial"]
coverImage: "/blog-images/react-fastapi.jpg"
---

# Building a Full Stack App with React and FastAPI

FastAPI has become my go-to framework for building backend APIs, and when combined with React, it creates a powerful full-stack development experience.

## Why FastAPI?

FastAPI offers several advantages:

- **Fast**: Built on Starlette and Pydantic, it's one of the fastest Python frameworks
- **Type Safety**: Automatic validation using Python type hints
- **Auto Documentation**: Interactive API docs with Swagger UI
- **Async Support**: Native async/await support

## Project Structure

```
project/
├── frontend/          # React app
│   ├── src/
│   ├── public/
│   └── package.json
└── backend/           # FastAPI app
    ├── app/
    │   ├── main.py
    │   ├── models.py
    │   └── routes/
    ├── requirements.txt
    └── .env
```

## Setting Up FastAPI Backend

### Install Dependencies

```bash
pip install fastapi uvicorn sqlalchemy pydantic python-jose passlib
```

### Create the Main Application

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="My API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to my API"}

@app.get("/api/users")
async def get_users():
    return {"users": []}
```

### Run the Server

```bash
uvicorn app.main:app --reload
```

## Building the React Frontend

### Setup React with Vite

```bash
npm create vite@latest frontend -- --template react
cd frontend
npm install axios react-query
```

### Create API Client

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getUsers = async () => {
  const { data } = await api.get('/api/users');
  return data;
};

export default api;
```

### Use React Query for Data Fetching

```javascript
import { useQuery } from 'react-query';
import { getUsers } from './api';

function UserList() {
  const { data, isLoading, error } = useQuery('users', getUsers);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data.users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

## Adding Authentication

### FastAPI JWT Authentication

```python
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"])

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@app.post("/api/login")
async def login(username: str, password: str):
    # Verify credentials
    token = create_access_token({"sub": username})
    return {"access_token": token, "token_type": "bearer"}
```

### React Auth Context

```javascript
import { createContext, useState, useContext } from 'react';
import api from './api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (username, password) => {
    const { data } = await api.post('/api/login', {
      username,
      password,
    });
    localStorage.setItem('token', data.access_token);
    api.defaults.headers.common['Authorization'] = 
      `Bearer ${data.access_token}`;
    setUser({ username });
  };

  return (
    <AuthContext.Provider value={{ user, login }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

## Database Integration

### SQLAlchemy Models

```python
from sqlalchemy import Column, Integer, String
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String)
    hashed_password = Column(String)
```

## Deployment

### FastAPI on Railway/Render

```bash
# Procfile
web: uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
```

### React on Vercel

```bash
npm run build
vercel --prod
```

## Conclusion

FastAPI + React is a powerful combination for modern web development. The type safety, performance, and developer experience make it my preferred stack for new projects.

Check out my [portfolio](https://shashikant-kataria.vercel.app) to see this stack in action!
