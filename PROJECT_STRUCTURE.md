# IntelliDoc AI - Project Structure

```
intellidoc-ai/
├── frontend/                          # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                   # ShadCN components
│   │   │   ├── auth/                 # Auth components
│   │   │   ├── dashboard/            # Dashboard components
│   │   │   ├── upload/               # Upload components
│   │   │   ├── analytics/            # Analytics components
│   │   │   └── chat/                 # RAG chatbot components
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── store/                    # Zustand stores
│   │   ├── services/                 # API services
│   │   ├── utils/
│   │   └── lib/
│   ├── public/
│   └── package.json
│
├── backend/                           # Node.js + Express Backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── config/
│   │   └── validators/
│   ├── tests/
│   └── package.json
│
├── ai-service/                        # Python FastAPI AI Microservice
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── security.py
│   │   ├── models/
│   │   ├── services/
│   │   │   ├── ocr_service.py
│   │   │   ├── layout_service.py
│   │   │   ├── llm_service.py
│   │   │   ├── rag_service.py
│   │   │   └── preprocessing_service.py
│   │   ├── schemas/
│   │   └── utils/
│   ├── ml_models/                     # Pre-trained models
│   ├── requirements.txt
│   └── main.py
│
├── docker/
│   ├── frontend.Dockerfile
│   ├── backend.Dockerfile
│   └── ai-service.Dockerfile
│
├── docker-compose.yml
├── .env.example
└── README.md
```
