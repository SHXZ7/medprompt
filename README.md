# 🩺 MedPrompt+ — AI-Powered Health Assistant

**MedPrompt+ is an intelligent, AI-powered web health assistant that empowers users to assess medical risk, interact with an AI chatbot, parse and analyze documents, and visualize health trends — all through a modern and beautiful dashboard.**


# ✨ Features

**🔹 AI Dashboard**

Personalized health overview

Quick actions and recent activities

Light/Dark mode toggle

**🔹 Health Assessment**

AI risk prediction using medical inputs

Lifestyle tips and a 7-day food calendar

Instant scoring: Low/Moderate/High risk

**🔹 AI Chat Assistant**

LLM-powered Q&A for health queries

Continuous memory-based conversations

Supports voice input and natural dialogue

**🔹 Document Parser**

Upload PDFs or images (lab reports)

Extracts key vitals (BMI, glucose, BP, etc.)

Generates summaries + runs RAG Q&A

**🔹 Health Visualizations**

Interactive glucose and BMI trend charts

Dynamic and responsive graphs

Export-ready outputs


# 🧠 Tech Stack

**🖥 Frontend (Next.js + Tailwind CSS)**

Modular pages for /assessment, 
/ai-chat, 
/documents, 
and /visualization.

Soft medical design with pastel gradients, rounded cards, shadows

Reusable components (e.g., Navbar, PageWrapper, DailyHealthTipCard)

Fully responsive layout with dark/light theme toggle


**🚀 Backend (FastAPI)**

ml.py: Scikit-learn/XGBoost health risk prediction APIs

openrouter.py: Gemini/OpenRouter AI endpoints for chat, summarization, plan generation, and document/image parsing

tips.py: Randomized health tips

utils/: OCR, PDF parsing, RAG search, chart generation


# 📦 Installation & Setup

**Clone the repo**
git clone https://github.com/yourusername/medprompt-app.git

**Backend (Python 3.9+)**
cd backend
uvicorn main:app --reload

**Frontend (Node.js 18+)**
cd ../frontend
npm install
npm run dev


# 📸 UI Reference

![image](https://github.com/user-attachments/assets/21392cd5-3f4f-4d55-9c24-ec291cb01c41) ![image](https://github.com/user-attachments/assets/f8fb02cd-94fd-4e38-9d8e-3e145f4e6f7b)


# 💡 Future Enhancements

Firebase integration (auth + storage)

Health history tracking

Personalized notification system

Auto-generated downloadable reports

Multi-language support



