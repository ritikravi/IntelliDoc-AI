# IntelliDoc AI - System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React Frontend (Vite + Tailwind + ShadCN)          │  │
│  │  - Authentication UI                                  │  │
│  │  - Document Upload                                    │  │
│  │  - Dashboard & Analytics                             │  │
│  │  - AI Chat Interface                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                        │
│                                                              │
│  ┌────────────────────┐         ┌──────────────────────┐   │
│  │  Node.js Backend   │◄───────►│  Python AI Service   │   │
│  │  (Express)         │         │  (FastAPI)           │   │
│  │                    │         │                      │   │
│  │  - Auth & JWT      │         │  - OCR Pipeline      │   │
│  │  - REST APIs       │         │  - LayoutLMv3        │   │
│  │  - File Upload     │         │  - Gemini LLM        │   │
│  │  - WebSockets      │         │  - RAG + FAISS       │   │
│  │  - Queue Mgmt      │         │  - Semantic Search   │   │
│  └────────────────────┘         └──────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                             │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   MongoDB    │  │    Redis     │  │  Cloudinary/S3   │  │
│  │   Atlas      │  │   Cache      │  │  File Storage    │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Component Details

### Frontend (React + Vite)

**Technology Stack:**
- React 18 with Hooks
- Vite for fast builds
- Tailwind CSS + ShadCN UI
- Framer Motion for animations
- Zustand for state management
- React Query for data fetching
- Axios for HTTP requests

**Key Features:**
- Modern SaaS UI design
- Dark/Light mode
- Responsive design
- Real-time updates
- Optimistic UI updates
- Skeleton loaders

**Pages:**
- `/login` - Authentication
- `/register` - User registration
- `/dashboard` - Overview & stats
- `/upload` - Document upload
- `/documents` - Document management
- `/analytics` - Data visualization
- `/chat` - AI chatbot
- `/profile` - User settings

---

### Backend (Node.js + Express)

**Technology Stack:**
- Express.js framework
- MongoDB + Mongoose ODM
- Redis for caching
- JWT authentication
- Multer for file uploads
- Cloudinary for storage
- WebSockets for real-time

**Architecture Pattern:**
- MVC (Model-View-Controller)
- Service layer for business logic
- Middleware for cross-cutting concerns
- Repository pattern for data access

**API Endpoints:**

```
Auth:
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
GET    /api/v1/auth/me

Documents:
POST   /api/v1/documents/upload
GET    /api/v1/documents
GET    /api/v1/documents/:id
DELETE /api/v1/documents/:id
POST   /api/v1/documents/process/:id

Analytics:
GET    /api/v1/analytics/overview
GET    /api/v1/analytics/trends
GET    /api/v1/analytics/vendors

Search:
GET    /api/v1/search?q=query
POST   /api/v1/search/semantic

Chat:
POST   /api/v1/chat/query
```

**Security Features:**
- JWT with refresh tokens
- Password hashing (bcrypt)
- Rate limiting
- CORS protection
- Input validation
- SQL injection prevention
- XSS protection

---

### AI Service (Python + FastAPI)

**Technology Stack:**
- FastAPI framework
- PaddleOCR + Tesseract
- OpenCV for preprocessing
- PyTorch + Transformers
- LayoutLMv3 for document understanding
- Gemini API for LLM
- LangChain for RAG
- FAISS for vector search

**Processing Pipeline:**

```
1. Image Preprocessing (OpenCV)
   ├── Grayscale conversion
   ├── Noise removal
   ├── Deskewing
   ├── Contrast enhancement
   └── Binarization

2. OCR Extraction
   ├── PaddleOCR (primary)
   ├── Tesseract (fallback)
   └── Bounding box detection

3. Layout Understanding (LayoutLMv3)
   ├── Field extraction
   ├── Table detection
   ├── Line item parsing
   └── Spatial analysis

4. LLM Validation (Gemini)
   ├── Error correction
   ├── Data normalization
   ├── Confidence scoring
   └── JSON generation

5. Post-Processing
   ├── Duplicate detection
   ├── Fraud detection
   ├── Embedding generation
   └── Database storage
```

**API Endpoints:**

```
POST /api/ocr/extract
POST /api/process
POST /api/semantic-search
POST /api/chat
GET  /health
```

---

## 💾 Data Models

### User Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  avatar: String,
  refreshToken: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Document Model
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  fileName: String,
  fileUrl: String,
  fileType: String,
  status: String (uploaded/processing/processed/failed),
  
  // Extracted Data
  invoiceNumber: String,
  vendorName: String,
  vendorGST: String,
  invoiceDate: Date,
  dueDate: Date,
  currency: String,
  subtotal: Number,
  taxAmount: Number,
  totalAmount: Number,
  lineItems: Array,
  
  // AI Metadata
  confidenceScore: Number,
  ocrEngine: String,
  processingTime: Number,
  embedding: Array,
  
  // Flags
  isDuplicate: Boolean,
  isFraudulent: Boolean,
  isVerified: Boolean,
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔄 Data Flow

### Document Upload Flow

```
1. User uploads file (Frontend)
   ↓
2. File sent to Backend API
   ↓
3. Backend uploads to Cloudinary
   ↓
4. Document record created in MongoDB
   ↓
5. Processing request sent to AI Service
   ↓
6. AI Service:
   - Downloads image
   - Runs OCR
   - Extracts fields
   - Validates with LLM
   ↓
7. Results sent back to Backend
   ↓
8. Backend updates MongoDB
   ↓
9. Frontend receives update (WebSocket/Polling)
   ↓
10. User sees processed document
```

### Search Flow

```
1. User enters search query
   ↓
2. Frontend sends to Backend
   ↓
3. Backend checks Redis cache
   ↓
4. If not cached:
   - Query MongoDB (text search)
   - OR call AI Service (semantic search)
   ↓
5. Results cached in Redis
   ↓
6. Results returned to Frontend
```

---

## 🚀 Scalability Considerations

### Horizontal Scaling
- Load balancer for Backend
- Multiple AI Service instances
- MongoDB replica sets
- Redis cluster

### Vertical Scaling
- GPU for AI processing
- Increased RAM for caching
- SSD for faster I/O

### Optimization
- CDN for static assets
- Image optimization
- Database indexing
- Query optimization
- Connection pooling

---

## 🔐 Security Architecture

### Authentication Flow
```
1. User login → Backend validates
2. Backend generates JWT + Refresh Token
3. JWT stored in memory (Frontend)
4. Refresh Token stored in httpOnly cookie
5. JWT expires in 15 minutes
6. Refresh Token expires in 7 days
7. Auto-refresh before expiry
```

### Authorization
- Role-based access control (RBAC)
- Resource-level permissions
- API key for AI Service
- Rate limiting per user

---

## 📊 Monitoring & Logging

### Metrics to Track
- API response times
- OCR accuracy rates
- Processing throughput
- Error rates
- User activity
- System resources

### Logging Strategy
- Structured logging (JSON)
- Log levels (DEBUG, INFO, WARN, ERROR)
- Centralized log aggregation
- Error tracking (Sentry)

---

## 🧪 Testing Strategy

### Frontend
- Unit tests (Jest)
- Component tests (React Testing Library)
- E2E tests (Playwright)

### Backend
- Unit tests (Jest)
- Integration tests (Supertest)
- API tests (Postman/Newman)

### AI Service
- Unit tests (pytest)
- Model accuracy tests
- Performance benchmarks

---

**This architecture is designed for:**
- ✅ Production deployment
- ✅ Horizontal scalability
- ✅ High availability
- ✅ Security best practices
- ✅ Maintainability
- ✅ IIT Hackathon winning quality
