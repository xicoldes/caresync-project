# CareSync - AI-Enhanced Drug Search & Management

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green)

**CareSync** is a smart healthcare web application designed to bridge the gap between regional drug brand names and official medical databases. By integrating **Groq AI** with the **FDA API**, CareSync translates non-US brand names (e.g., Panadol, Curam) into their US generic equivalents to fetch accurate safety and usage data. The platform allows users to search for medications, check for interactions, and manage a personal "Medicine Cabinet" with persistent storage.

---

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Usage](#usage)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Features

- **AI-Powered Brand Translation**: Utilizes **Groq AI** to interpret local or non-US drug brand names (e.g., "Panadol") and map them to their standard US FDA generic equivalents (e.g., "Acetaminophen") before querying the database.
- **Intelligent Result Prioritization**: Implements a "Best Match" algorithm that filters FDA results to prioritize standard adult medications over niche variants (e.g., displaying "Zyrtec" before "Children's Zyrtec").
- **Saved Medicines Cabinet**: A persistent "My Cabinet" feature that allows users to save medications. It stores full AI-generated details including usage instructions, side effects, and warnings to prevent data loss.
- **Drug Interaction Checker**: Analyzes potential interactions between multiple drugs in the user's list using AI analysis.
- **Responsive UI**: A modern interface featuring a card-grid layout for saved medicines, detailed modal views, and seamless navigation.
- **Deep Linking**: Built with **React Router** to support browser history, allowing users to bookmark specific search results and navigate back/forward intuitively.

---

## Demo

### Smart Drug Search
![Search Results Screenshot](images/search.png)
*AI translates brand names and prioritizes the most relevant FDA results.*

### My Medicine Cabinet
![My Cabinet Screenshot](images/cabinet.png)
*Manage your saved medications with a clean, responsive card layout.*

### Interaction Checker
![Interaction Checker Screenshot](images/interaction.png)
*Check for potential adverse reactions between your saved drugs.*

---

## Tech Stack

### Frontend
- **React**: Component-based UI library.
- **React Router**: For client-side routing and deep linking.
- **CSS Modules**: For scoped and modular styling.
- **Axios**: For making HTTP requests to the backend.

### Backend
- **Node.js & Express**: Server-side runtime and framework.
- **MongoDB Atlas**: Cloud database for user authentication and storing saved medicines.
- **Mongoose**: ODM for MongoDB interaction.
- **Groq SDK**: Interface for AI-powered data processing and translation.
- **FDA Drug Label API**: Source for official drug labeling and safety data.

---

## Project Structure

```bash
CARESYNC-PROJECT/
├── client/                       # Frontend React Application
│   ├── node_modules/             # Client Dependencies
│   ├── public/                   # Static assets (favicons, manifest)
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Auth.js           # Login/Register forms
│   │   │   ├── DrugBrowse.js     # A-Z Drug browsing list
│   │   │   ├── DrugSearch.js     # Main search bar & results
│   │   │   ├── InteractionChecker.js # Drug interaction tool
│   │   │   └── MyCabinet.js      # Saved medicines grid view
│   │   ├── pages/                # Page layouts (if separated)
│   │   ├── App.css               # Global application styles
│   │   ├── App.js                # Main Router & Layout logic
│   │   ├── index.js              # React Entry Point
│   │   └── setupTests.js
│   ├── .env                      # Frontend environment variables
│   ├── package.json
│   └── README.md
├── server/                       # Backend Node.js Application
│   ├── config/                   # Configuration files
│   │   └── db.js                 # MongoDB connection logic
│   ├── models/                   # Mongoose Database Models
│   │   ├── CachedDrug.js         # Cache for FDA/AI search results
│   │   ├── User.js               # User schema & saved medicines
│   │   └── Medicine.js           # (Optional) Static drug data
│   ├── routes/                   # API Route Definitions
│   │   ├── authRoutes.js         # User registration & login
│   │   ├── fdaRoutes.js          # Drug search & AI translation logic
│   │   ├── interactionRoutes.js  # Interaction checking logic
│   │   ├── medicineRoutes.js     # Cabinet management routes
│   │   └── userRoutes.js         # User profile routes
│   ├── .env                      # Backend environment variables
│   ├── index.js                  # Server Entry Point
│   └── package.json
├── .gitignore                    # Root gitignore
└── README.md                     # Project Documentation
```
## Getting Started

Gemini said
Here is the comprehensive README.md for your CareSync project.

Markdown
# CareSync - AI-Enhanced Drug Search & Management

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green)

**CareSync** is a smart healthcare web application designed to bridge the gap between regional drug brand names and official medical databases. By integrating **Groq AI** with the **FDA API**, CareSync translates non-US brand names (e.g., Panadol, Curam) into their US generic equivalents to fetch accurate safety and usage data. The platform allows users to search for medications, check for interactions, and manage a personal "Medicine Cabinet" with persistent storage.

---

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Usage](#usage)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Features

- **AI-Powered Brand Translation**: Utilizes **Groq AI** to interpret local or non-US drug brand names (e.g., "Panadol") and map them to their standard US FDA generic equivalents (e.g., "Acetaminophen") before querying the database.
- **Intelligent Result Prioritization**: Implements a "Best Match" algorithm that filters FDA results to prioritize standard adult medications over niche variants (e.g., displaying "Zyrtec" before "Children's Zyrtec").
- **Saved Medicines Cabinet**: A persistent "My Cabinet" feature that allows users to save medications. It stores full AI-generated details including usage instructions, side effects, and warnings to prevent data loss.
- **Drug Interaction Checker**: Analyzes potential interactions between multiple drugs in the user's list using AI analysis.
- **Responsive UI**: A modern interface featuring a card-grid layout for saved medicines, detailed modal views, and seamless navigation.
- **Deep Linking**: Built with **React Router** to support browser history, allowing users to bookmark specific search results and navigate back/forward intuitively.

---

## Demo

### Smart Drug Search
<img width="1919" height="1056" alt="image" src="https://github.com/user-attachments/assets/a0f13897-fa83-4558-8a8f-5b3dba029d9c" />

<img width="1919" height="1057" alt="image" src="https://github.com/user-attachments/assets/d820f54d-c4b3-4059-9d18-da1ebb226d68" />

<img width="1918" height="1058" alt="image" src="https://github.com/user-attachments/assets/a0e37fa4-3046-4fe6-9077-76136d5cc658" />
*AI translates brand names and prioritizes the most relevant FDA results.*

### My Medicine Cabinet
<img width="1919" height="1058" alt="image" src="https://github.com/user-attachments/assets/001f9c08-a1b0-47be-8b08-13cf2e003af5" />

<img width="1919" height="1054" alt="image" src="https://github.com/user-attachments/assets/833def13-118e-4f09-95d8-0feb48705f87" />

<img width="1919" height="1054" alt="image" src="https://github.com/user-attachments/assets/e2e321ac-fd00-42fe-a9c3-2cabc34ddaee" />
*Manage your saved medications with a clean, responsive card layout.*

### Interaction Checker
<img width="1919" height="1056" alt="image" src="https://github.com/user-attachments/assets/1dddeacb-ad3b-4816-ac96-d7e85ebd7f0c" />

*Check for potential adverse reactions between your saved drugs.*

---

## Tech Stack

### Frontend
- **React**: Component-based UI library.
- **React Router**: For client-side routing and deep linking.
- **CSS Modules**: For scoped and modular styling.
- **Axios**: For making HTTP requests to the backend.

### Backend
- **Node.js & Express**: Server-side runtime and framework.
- **MongoDB Atlas**: Cloud database for user authentication and storing saved medicines.
- **Mongoose**: ODM for MongoDB interaction.
- **Groq SDK**: Interface for AI-powered data processing and translation.
- **FDA Drug Label API**: Source for official drug labeling and safety data.

---

## Project Structure

```bash
CARESYNC-PROJECT/
├── client/                       # Frontend React Application
│   ├── node_modules/             # Client Dependencies
│   ├── public/                   # Static assets (favicons, manifest)
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Auth.js           # Login/Register forms
│   │   │   ├── DrugBrowse.js     # A-Z Drug browsing list
│   │   │   ├── DrugSearch.js     # Main search bar & results
│   │   │   ├── InteractionChecker.js # Drug interaction tool
│   │   │   └── MyCabinet.js      # Saved medicines grid view
│   │   ├── pages/                # Page layouts (if separated)
│   │   ├── App.css               # Global application styles
│   │   ├── App.js                # Main Router & Layout logic
│   │   ├── index.js              # React Entry Point
│   │   └── setupTests.js
│   ├── .env                      # Frontend environment variables
│   ├── package.json
│   └── README.md
├── server/                       # Backend Node.js Application
│   ├── config/                   # Configuration files
│   │   └── db.js                 # MongoDB connection logic
│   ├── models/                   # Mongoose Database Models
│   │   ├── CachedDrug.js         # Cache for FDA/AI search results
│   │   ├── User.js               # User schema & saved medicines
│   │   └── Medicine.js           # (Optional) Static drug data
│   ├── routes/                   # API Route Definitions
│   │   ├── authRoutes.js         # User registration & login
│   │   ├── fdaRoutes.js          # Drug search & AI translation logic
│   │   ├── interactionRoutes.js  # Interaction checking logic
│   │   ├── medicineRoutes.js     # Cabinet management routes
│   │   └── userRoutes.js         # User profile routes
│   ├── .env                      # Backend environment variables
│   ├── index.js                  # Server Entry Point
│   └── package.json
├── .gitignore                    # Root gitignore
└── README.md                     # Project Documentation
```

---

## Getting Started
### Prerequisites
- **Node.js** (v14 or higher)

- **npm** (Node Package Manager)

- **MongoDB Atlas account** (or local MongoDB)

- **Groq API Key** (for AI features)

- **FDA API Key** (optional, but recommended for higher rate limits)

---

## Installation
### Clone the repository:

```bash
git clone [https://github.com/your-username/caresync.git](https://github.com/your-username/caresync.git)
cd caresync
```

Install Server Dependencies:
```bash
cd server
npm install
```

Install Client Dependencies:
```bash
cd ../client
npm install
```

---

## Environment Variables
You need to configure environment variables for both the client and the server.


### 1. Server Configuration
Create a .env file in the server/ directory:

```bash
PORT=5000
MONGO_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
FDA_API_KEY=your_fda_api_key_optional
JWT_SECRET=your_jwt_secret_key
```
### 2. Client Configuration
Create a .env file in the client/ directory:
```bash
REACT_APP_API_URL=http://localhost:5000
```

---

## API Endpoints
The backend exposes the following RESTful API endpoints:

### Authentication
- POST /api/auth/register - Register a new user.

- POST /api/auth/login - Authenticate user and return JWT.

### Drug Search (FDA + AI)
- GET /api/fda/search?query=:drugName - Search for a drug. Handles brand-to-generic translation via AI if direct search fails.

### Safety Checks
- POST /api/safety/check - Analyzes a list of drugs for potential interactions.

### User Cabinet
- GET /api/user/medicines - Retrieve the logged-in user's saved medicines.

- POST /api/user/add - Save a new medicine to the user's cabinet.

- DELETE /api/user/remove/:id - Remove a medicine from the cabinet.

---

## Usage
### Start the Backend Server:

```bash
cd server
npm start
# Server runs on http://localhost:5000
Start the Frontend Client:
```

```bash
cd client
npm start
# Client runs on http://localhost:3000
```

### Perform a Search:

- Enter a drug name (e.g., "Curam") in the search bar.

- The system will detect if it's a non-US brand, translate it to "Amoxicillin and Clavulanate", and fetch the correct FDA data.

### Save a Medicine:

- Click "Save to Cabinet" on any search result.

- Navigate to "My Cabinet" to view your saved list.

---

## License
This project is licensed under the MIT License.

---

## Acknowledgments
- openFDA: For providing the open API for drug labeling and safety data.

- Groq AI: For the high-performance LLM used for brand translation and data summarization.

- Ngee Ann Polytechnic: School of Infocomm Technology.



















