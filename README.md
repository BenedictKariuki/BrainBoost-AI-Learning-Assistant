# BrainBoost Learning Assistant

An AI-powered learning platform that transforms PDF documents into interactive study resources. Upload your study materials and use artificial intelligence to generate quizzes, flashcards, summaries, concept explanations, and document-focused conversations.

---

## Features

### 📄 PDF Upload and Viewing

* Upload PDF documents up to **20 MB**.
* View and read documents directly within the application.
* Manage uploaded learning resources from a centralized dashboard.

### 🤖 AI-Powered Document Chat

* Chat with Gemini AI about the contents of uploaded documents.
* Ask questions and receive context-aware answers.
* Explore concepts and gain deeper understanding of study materials.

### 📝 Quiz Generation

* Generate quizzes automatically from uploaded PDFs.
* Take quizzes directly within the application.
* Receive instant scoring and feedback.
* Review answers and explanations after completion.

### 🧠 Flashcard Generation

* Automatically generate flashcards from document content.
* Reinforce learning through active recall.
* Study key concepts efficiently.

### 📚 AI Summaries

* Generate concise summaries of lengthy documents.
* Quickly identify key ideas and important topics.

### 💡 Concept Explanations

* Request detailed explanations of complex concepts.
* Receive simplified, AI-generated explanations tailored to the document context.

### 🔐 User Authentication

* Secure registration and login.
* Personalized access to documents and generated learning resources.

---

## Technology Stack

### Frontend

* React
* React Router
* Tailwind CSS
* Axios
* Lucide React

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication

### AI Integration

* Google Gemini API

### File Processing

* PDF Text Extraction and Processing

---

## How It Works

1. Upload a PDF document.
2. The system extracts and processes the document text.
3. Use AI-powered tools to:

   * Generate quizzes
   * Generate flashcards
   * Create summaries
   * Explain concepts
   * Chat about the document
4. Review and interact with generated learning resources.

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/BenedictKariuki/BrainBoost-AI-Learning-Assistant.git
cd BrainBoost-AI-Learning-Assistant
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
DB_NAME = name-of-your-db
DB_PORT= the-port-on-which-the-db-instance-is-running
DB_HOST = "127.0.0.1"
DB_USERNAME = db-username
DB_PASSWORD = db-password
NODE_ENV = "development"
JWT_SECRET = your_jwt_secret
JWT_EXPIRE = "7d"
MAX_FILE_SIZE = 10485760
GEMINI_API_KEY=your_gemini_api_key
```

Start the backend server:

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend/ai-learning-assitant
npm install
npm run dev
```

---

## Project Structure

```text
BrainBoost-AI-Learning-Assistant/
├── backend/
|   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
|   ├── uploads/
|   ├── utils/
|   ├── services/
|   ├── package.json
|   ├── .env
│   └── server.js
│
├── frontend/
|   ├── ai-learning-assistant/
|       ├── public/
│       ├── src/
|           ├── assets/
│           ├── components/
|           ├── context/
│           ├── pages/
│           ├── utils/
|           ├── services/
|           ├── App.jsx
|           ├── index.css
│           └── main.jsx
|       ├── index.html
|       ├── package.json
|       └── vite.config.js
│
└── README.md
```

---

## Future Enhancements

* Spaced repetition flashcards
* Highlights
* Comments
* Sticky notes
* Drawing tools
* Signatures
* Text markup
* Annotations
* Learning analytics dashboard
* Study progress tracking
* Export quizzes and flashcards
* Mobile application support
* Collaborative study groups

---

## Screenshots

Add screenshots here to showcase:

* Dashboard
  <img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/ca72687f-f073-44e5-8802-4b1f7e2e1971" />
  
---

* Sign up
  <img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/3af8ebca-10fb-4364-a730-e120088ea335" />

---

* Login
  <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/6f17afbd-1653-4e56-874e-82723a439dc7" />

---

* PDF Viewer
  <img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/d95b2566-c03e-49b6-b532-7c3aed97f432" />

---

* AI Chat
  <img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/d775274b-6f50-4329-9734-bd26f58f9741" />

---

* Generate Summary and Explain concept
  <img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/0f7e4c0f-b949-4136-8b6c-56944bd164ac" />

---

* Quiz Interface
  <img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/e28e1093-afd3-49f9-b94a-bad43acf8306" />
  <img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/9aedf20c-d129-4be7-b74a-4e7d64052c46" />
  <img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/385bf1fd-f6da-47d8-9c6d-cb1024f7053e" />

---

* Generate Quiz Modal
  <img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/1a86dd06-f82e-4df6-977a-c8ae37e6c295" />

---

* Flashcard Sets
  <img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/528e5dd5-06a1-4275-97fd-318f66bb28ab" />

---

* Flashcards
  <img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/7f5a2748-4f20-4dd7-b896-ccdcf7049711" />

---

* Documents
  <img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/7f627474-aac2-41d7-bbcb-fd6f098d5150" />

---

* Upload document modal
  <img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/0cc9f86d-1e1d-40ca-b108-3551b4af9d32" />

---

* Document Details
  <img width="1920" height="1032" alt="image" src="https://github.com/user-attachments/assets/afaceca5-933e-45dc-8c9d-5a4da6b706ec" />

---

## Author

**Benedict Kariuki**

BrainBoost Learning Assistant is a full-stack educational technology project designed to improve learning outcomes through artificial intelligence.
