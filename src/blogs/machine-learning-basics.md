---
title: "Python Basics for Machine Learning"
description: "A beginner-friendly guide to Python fundamentals for aspiring machine learning practitioners. Covers numbers, data structures, control flow, functions, modules, and more."
date: "2024-12-10"
author: "Shashikant Kataria"
tags: ["Python", "Machine Learning", "Beginner", "Tutorial", "Data Science"]
coverImage: "/blog-images/machine-learning-basics.png"
---

# Machine Learning

## Machine Learning - Formal Defination (Tom Mitchel)
A computer program is said to learn from experience (E) with respect to some task (T) and performance (P), if its performance at task T, as measures by P, improve with experience E.
- Task(T): What problem are we solving
- Experience: What does the model see
- Performance: How do we measure success

Example:
&ensp;T: Classify email as spam/not spam
&ensp;E: Labeled Email
&ensp;P: Accuracy, precision, recall

## Python For Machine Learning:
<b>Python</b>: Python is an interpreted, dynamically typed and a high level language
- Interpreted: A programming language in which code execcutes line by line directly and does not need any compilation like java and C++.
```python
x = 5           #this line runs first
y = x + 5       #this will after first line
```
- Dynamically Typed: Variable data types are checked and assinged at run time instead of compile time like C++ or C (statically typed).
```python
x = 5           #x is integer
x = "shashi"    #here x is string
```
- High Level: Syntax is more friendly to human than computer. 

### Variable and Memory Model
```python
x = 5 #five stored in memery with  address 0x7bfas and x is reference x -> 0x7bfas
```
Here x = 5 does not mean a box which contains 5, Here, 5 is an object of type int which has assigned some memory at the run time and x is reference to that particular memory. 
```python
x = 5
type(x) #return type of variable; Output: <class 'int'>
y = x
id(y) = id(x) #id print the memory location of that object ;Output: True
```
#### Mutabile VS Immutable
|Type        | Mutable? |  
|------------|----------|  
|int         |    no   |
|float       |      no    |
|str         |    no      |
|tuple       |    no      |
|list        |    yes      |
|dict        |    yes      |
|set         |    yes      |
|numpy array |    yes      

### Numbers in Python: Integers and Floats

Python provides robust support for working with numbers, which is essential for any machine learning or data science task. Let's look at two fundamental numeric types: integers (`int`) and floating-point numbers (`float`).

#### Unlimited Precision for Integers
Unlike many other programming languages, Python's `int` type can handle arbitrarily large numbers without overflowing:
```python
x = 10 ** 100  # This is a 1 followed by 100 zeros!
print(x) # Output: 10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
```
This feature is especially useful in scientific computing and cryptography, where very large numbers are common. In languages like C or Java, exceeding the maximum value for an integer type causes an overflow, but in Python, the number just keeps growing as needed.

#### Floating Point Arithmetic and Precision Issues
Floating-point numbers (`float`) are used to represent real numbers, but they have limited precision due to how computers store them in binary. This can lead to surprising results:
```python
0.1 + 0.2 == 0.3  # Output: False
print(0.1 + 0.2)   # Output: 0.30000000000000004
```
Why does this happen? Computers store floating-point numbers in binary, and some decimal fractions (like 0.1 or 0.2) cannot be represented exactly. This is similar to how 1/3 cannot be written exactly in decimal (0.3333...).

### Booleans in Python

Booleans are a fundamental data type in Python, representing truth values: `True` and `False`. They are essential for controlling program logic, making decisions, and are heavily used in machine learning for things like filtering data, checking conditions, and evaluating model performance.

#### Boolean Values and Type
```python
is_active = True
is_trained = False
print(type(is_active))  # Output: <class 'bool'>
```

#### Boolean Conversion
You can convert other data types to boolean using the `bool()` function. This is useful for checking if a value is "empty" or "zero":
```python
bool(0)        # False (zero is considered False)
bool(1)        # True (non-zero numbers are True)
bool("")      # False (empty string)
bool("hello") # True (non-empty string)
bool([])       # False (empty list)
bool([1,2,3])  # True (non-empty list)
```

#### Practical Example: Filtering Data
Booleans are often used in conditions and filtering. For example, filtering out empty values from a list:
```python
data = [0, 1, "", "ML", [], [1,2]]
filtered = [item for item in data if bool(item)]
print(filtered)  # Output: [1, 'ML', [1, 2]]
```

#### In Machine Learning
Booleans are used to check if a model has converged, if a prediction is correct, or to apply masks to arrays (e.g., in NumPy or pandas):
```python
# Example: Checking prediction correctness
predicted = [1, 0, 1, 1]
actual =    [1, 0, 0, 1]
correct = [p == a for p, a in zip(predicted, actual)]
print(correct)  # Output: [True, True, False, True]
accuracy = sum(correct) / len(correct)
print(accuracy) # Output: 0.75
```

### Strings in Python

Strings are sequences of characters and are one of the most commonly used data types in Python, especially for handling text data in machine learning (e.g., processing labels, file paths, or textual features).

#### Immutability
Strings in Python are **immutable**, meaning you cannot change their contents after creation. Any operation that modifies a string actually creates a new string:
```python
s = "shashi" # s[0] = "S"  # This will raise an error: 'str' object does not support item assignment
s = "S" + s[1:]  # Correct way to change the first character
print(s)  # Output: 'Shashi'
```

#### String Slicing and Indexing
You can access individual characters or substrings using indexing and slicing:
```python
s = "machine"
print(s[0])    # Output: 'm' (first character)
print(s[-1])   # Output: 'e' (last character)
print(s[0:4])  # Output: 'mach' (substring from index 0 to 3)
print(s[2:])   # Output: 'chine' (substring from index 2 to end)
```

#### Useful String Methods
Python provides many built-in methods for string manipulation, which are very useful in data cleaning and feature engineering:
```python
text = "  Machine Learning  "
print(text.strip())      # Remove leading/trailing whitespace: 'Machine Learning'
print(text.lower())      # Convert to lowercase: '  machine learning  '
print(text.replace(" ", "_"))  # Replace spaces with underscores: '__Machine_Learning__'
print("learn" in text.lower())  # Check for substring: True
```

#### Practical Example: Preprocessing Text Data
In machine learning, you often need to preprocess text data:
```python
sentence = "  Hello, World!  "
cleaned = sentence.strip().lower().replace(",", "")
print(cleaned)  # Output: 'hello world!'
```
### Core Data Structures
#### Lists in Python

Lists are one of the most versatile and widely used data structures in Python. They are essential for storing sequences of items, such as datasets, feature vectors, or results in machine learning workflows.

**Properties:**
- **Ordered:** The order of elements is preserved.
- **Mutable:** You can change, add, or remove elements after creation.
- **Heterogeneous:** Lists can contain elements of different types (though for ML, usually all elements are the same type).

```python
data = [1, 2, 3, 4] # Creating a list
mixed = [1, "ML", 3.14, True] # Lists can hold any type
```

##### Common List Operations
```python
data.append(5)      # Add an element to the end: [1, 2, 3, 4, 5]
data.pop()          # Remove and return the last element: [1, 2, 3, 4]
data[1:3]           # Slicing: [2, 3] (elements at index 1 and 2)
len(data)           # Get the number of elements: 4
data[0]             # Access first element: 1
data[-1]            # Access last element: 4
```

##### List Comprehensions
List comprehensions provide a concise way to create lists. They are widely used in data processing and feature engineering.

**Without condition:**
```python
squares = [x*x for x in range(10)]  # List of all squares from 0 to 9
print(squares)  # Output: [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
```

**With condition:**
```python
even = [ x for x in range(10) if x % 2 == 0] # List of all even numbers from 0 to 9
```
#### Tuples in Python

Tuples are ordered, immutable collections in Python. Once created, their contents cannot be changed, making them useful for representing fixed collections of items. Tuples are commonly used in machine learning for coordinates, returning multiple values from functions, and as keys in dictionaries (since they are hashable).

**Properties:**
- **Ordered:** The order of elements is preserved.
- **Immutable:** Elements cannot be changed after creation.
- **Hashable:** Can be used as dictionary keys if all elements are hashable.

```python
point = (2, 3) # Creating a tuple
print(point[0])  # Output: 2

x, y = point # Tuple unpacking
print(x, y)  # Output: 2 3

model_config = ("ResNet", 50, True) # Tuples can store heterogeneous data

def min_max(values): # Useful for returning multiple values from a function
    return min(values), max(values)

result = min_max([3, 1, 9, 7])
print(result)  # Output: (1, 9)

grid = {} # Tuples as dictionary keys (e.g., for grid coordinates)
grid[(0, 0)] = "start"
grid[(1, 2)] = "goal"
print(grid) # Output: {(0, 0): 'start', (1, 2): 'goal'}

```
**Common Uses:**
- Coordinates (e.g., (x, y))
- Fixed experiment configurations
- Keys in dictionaries
- Returning multiple values from functions

#### Dictionaries in Python

Dictionaries are powerful, flexible data structures that store key-value pairs. They are widely used in Python for fast lookups, organizing data, and representing structured information (like JSON). In machine learning, dictionaries are often used for configuration, mapping labels, and storing results.

**Properties:**
- **Hash-based:** Keys must be immutable (e.g., strings, numbers, tuples).
- **O(1) Lookup:** Accessing a value by key is very fast.
- **Unordered (Python <3.7):** Insertion order is preserved in Python 3.7+.

```python
student = {
    "name": "shashi",
    "cgpa": 9.84
} # Creating a dictionary

print(student["name"]) # Accessing values; Output: 'shashi'

student["branch"] = "CSE" # Adding or updating values
student["cgpa"] = 9.9

for key, value in student.items(): # Iterating over keys and values
    print(key, value)

if "cgpa" in student: # Checking if a key exists
    print("CGPA is recorded.")

del student["branch"] # Removing a key

labels = ["cat", "dog", "rabbit"] # Dictionary comprehension (useful in ML for mapping labels)
label_to_index = {label: idx for idx, label in enumerate(labels)}
print(label_to_index)  # Output: {'cat': 0, 'dog': 1, 'rabbit': 2}
```

**Common Uses:**
- Storing structured data (e.g., a dataset row)
- Mapping labels to indices or values
- Configuration and hyperparameters
- Counting occurrences (with `collections.Counter`)

#### Sets in Python

Sets are unordered collections of unique elements. They are useful for removing duplicates, performing set operations (like union and intersection), and quickly checking membership. In machine learning, sets are often used to find unique labels, filter duplicates, or compare groups.

**Properties:**
- **Unordered:** No guaranteed order of elements.
- **Mutable:** You can add or remove elements.
- **Unique Elements:** No duplicates allowed.

```python
unique_labels = set([1, 2, 3, 4, 5, 2, 3]) # Creating a set
print(unique_labels)  # Output: {1, 2, 3, 4, 5}

unique_labels.add(6) # Adding and removing elements
unique_labels.remove(3)
print(unique_labels)  # Output: {1, 2, 4, 5, 6}

a = set([1, 2, 3]) # Set operations
b = set([2, 3, 4])
print(a | b)  # Union: {1, 2, 3, 4}
print(a & b)  # Intersection: {2, 3}
print(a - b)  # Difference: {1}


print(2 in a) # Checking membership; Output: True

labels = ["cat", "dog", "cat", "rabbit", "dog"] # Practical example: Find unique classes in a dataset
unique_classes = set(labels)
print(unique_classes)  # Output: {'cat', 'dog', 'rabbit'}
```

**Common Uses:**
- Removing duplicates from data
- Membership testing (fast `in` checks)
- Set operations (union, intersection, difference)
- Finding unique classes or labels in datasets

### Control Flow in Python

Control flow statements allow you to make decisions and execute code conditionally. The most common are `if`, `elif`, and `else`.

#### if / elif / else
```python
score = 85
if score >= 90:
    grade = "A"
elif score >= 75:
    grade = "B"
else:
    grade = "C"
print(grade)  # Output: 'B'
```

In machine learning, control flow is often used to check for convergence, save the best model, or handle different cases in data processing:
```python
if loss < best_loss:
    save_model()
    print("New best model saved!")
else:
    print("No improvement.")
```

#### For Loops in Python

`for` loops are used to iterate over sequences (like lists, tuples, or ranges) and perform actions repeatedly. They are essential in machine learning for tasks like training over multiple epochs, processing batches, or iterating through data.

**Basic Example:**
```python
for i in range(5):
    print(i) # Output: 0 1 2 3 4 
```

**Practical Example: Training a Model**
```python
epochs = 10
for epoch in range(epochs):
    train()
    print(f"Epoch {epoch+1} completed.")
```

**Iterating Over a List:**
```python
features = ["age", "salary", "education"]
for feature in features:
    print("Processing:", feature)
```

#### While Loops in Python

`while` loops repeatedly execute a block of code as long as a condition is true. They are useful when the number of iterations is not known in advance. In machine learning, while loops can be used for training until convergence or waiting for a process to finish.

**Basic Example:**
```python
count = 0
while count < 5:
    print(count)
    count += 1 # Output: 0 1 2 3 4 

```

**Practical Example: Training Until Convergence**
```python
while not model.has_converged():
    train_one_epoch()
    print("Training...")
print("Model converged!")
```

**Caution:**
Infinite loops (like `while True:`) will run forever unless you use a `break` statement or another exit condition. Use them carefully!
### Functions in Python

Functions are reusable blocks of code that perform a specific task. They help organize code, avoid repetition, and make programs easier to read and maintain. In machine learning, functions are used for data preprocessing, feature engineering, model training, evaluation, and more.

**Defining and Using Functions:**
```python
def mean(values): # Define a function to calculate the mean of a list
    return sum(values) / len(values)

data = [1, 2, 3, 4, 5] # Call the function
print(mean(data))  # Output: 3.0
```

**Functions with Multiple Arguments and Default Values:**
```python
def power(x, n=2):
    return x ** n

print(power(3))    # Output: 9 (default n=2)
print(power(3, 3)) # Output: 27
```

**Returning Multiple Values:**
```python
def min_max(values):
    return min(values), max(values)

lo, hi = min_max([4, 1, 9, 7])
print(lo, hi)  # Output: 1 9
```

**Practical Example: Data Normalization Function**
```python
def normalize(values):
    min_val, max_val = min(values), max(values)
    return [(x - min_val) / (max_val - min_val) for x in values]

data = [10, 20, 30]
print(normalize(data))  # Output: [0.0, 0.5, 1.0]
```

### Modules and Import Paths in Python

As your codebase grows, it's important to organize your code into multiple files and reuse code efficiently. Python achieves this using **modules** and **packages**.

#### What is a Module?
A module is simply a Python file (`.py`) that can contain functions, classes, and variables. You can import and use code from other modules to keep your code organized and avoid repetition.

#### Importing Modules
You can import built-in modules, third-party libraries, or your own files:
```python
import math # Import a built-in module
print(math.sqrt(16))  # Output: 4.0

from math import pi # Import a specific function
print(pi)  # Output: 3.141592653589793

import numpy as np # Import a third-party library (e.g., numpy)
arr = np.array([1, 2, 3])
print(arr)

import utils # Import your own module (suppose you have utils.py in the same folder)
utils.my_function()
```

#### Import Paths
When you import a module, Python searches for it in the following order:
1. The current directory (where your script is running)
2. The directories listed in the `PYTHONPATH` environment variable
3. The standard library directories

You can check the search path with:
```python
import sys
print(sys.path)
```

#### Why Modules Matter in Machine Learning
- You can separate data loading, preprocessing, model definition, and evaluation into different files.
- You can reuse utility functions across multiple projects.
- You can leverage powerful third-party libraries (like numpy, pandas, scikit-learn, tensorflow, etc.) by importing them.

**Example Project Structure:**
```
my_ml_project/
├── data_loader.py
├── preprocessing.py
├── model.py
├── train.py
├── utils.py
```
In `train.py`, you might write:
```python
from data_loader import load_data
from model import build_model
from utils import plot_results

data = load_data()
model = build_model()
```

**Tip:**
Use modules and imports to keep your code clean, modular, and maintainable—an essential skill for any machine learning project!
---

*Currently, I'm building innovative web solutions and sharing my knowledge through this blog. Connect with me on [GitHub](https://github.com/shashix07) or [LinkedIn](https://linkedin.com/in/shashikant-kataria) to discuss technology, startups, or life at IIT!*
