/*
Reason for existence: Portfolio metadata and microservice registry representing SILVESTRIKE GitHub repositories as active server services and Docker container cards.
System impact if absent: Portfolio services, Docker workstation cards, and interactive repository sandboxes will lack catalog data and execution definitions.
*/

import { ServiceUnit } from '@/types';

export const portfolioServices: ServiceUnit[] = [
  {
    name: 'samco-binhtan.service',
    displayName: 'SAMCO Binh Tan - Enterprise EV Sales CMS',
    image: 'samco-binhtan-cms:v2.1',
    containerName: 'samco-cms-prod',
    status: 'deployed',
    pid: 1980,
    memory: '94.0 MB',
    uptime: '240d 12h',
    description: 'Automotive dealership CMS & e-commerce platform for SAMCO Binh Tan EV showroom with vehicle inventory tracking and lead management.',
    repoUrl: 'https://github.com/SILVESTRIKE/samco-binhtan-webapp',
    deployUrl: 'https://samco-binhtan-webapp.vercel.app',
    language: 'Next.js / Prisma',
    category: 'web',
    hasSandbox: true,
    ports: '443:443 -> samco-binhtan-webapp.vercel.app',
    environment: ['FRAMEWORK=Next.js 14', 'ORM=Prisma Client', 'DB=PostgreSQL 15', 'AUTH=NextAuth.js'],
    dependsOn: ['nextjs-ui', 'api-bff', 'prisma-client', 'postgresql:5432'],
    healthcheck: '[HEALTHY] 100% test pass, 0 downtime, 15,000+ monthly visits vehicle catalog',
    logs: [
      'Next.js 14 server actions active',
      'Prisma connection pool: 8/10 active',
      'Edge cache TTL: 3600s'
    ]
  },
  {
    name: 'veritas-rag.service',
    displayName: 'Veritas Legal RAG - Vietnamese Legal QA Thesis',
    image: 'veritas-legal-rag:v1.0',
    containerName: 'veritas-engine',
    status: 'running',
    pid: 4280,
    memory: '245.0 MB',
    uptime: '18d 06h',
    description: 'B.Eng graduation thesis research: Multi-stage legal question-answering architecture using Hybrid Dense+Sparse retrieval, Qdrant Vector DB, and LangGraph.',
    repoUrl: 'https://github.com/SILVESTRIKE/Veritas-Legal-RAG',
    language: 'Python / PyTorch',
    category: 'ai',
    hasSandbox: true,
    ports: '8000:8000 -> api.veritas-rag.internal',
    environment: ['RUNTIME=Python 3.11', 'ORCHESTRATOR=LangGraph', 'VECTOR_DB=Qdrant', 'EMBED=bge-m3'],
    dependsOn: ['legal-crawler', 'hybrid-retriever (dense+sparse)', 'qdrant-cluster', 'cross-encoder-reranker', 'groq-lpu'],
    healthcheck: '[HEALTHY] Top-5 retrieval precision: 92.4% over 15,000 Vietnamese legal articles',
    logs: [
      'Qdrant vector collection: 15,420 legal documents indexed',
      'BM25 + Dense hybrid score fusion alpha: 0.6',
      'Cross-encoder rerank latency: 48ms'
    ]
  },
  {
    name: 'dogdexx.service',
    displayName: 'DogDexx - AI Dog Breed & Health Platform',
    image: 'dogdexx-ai:v1.2',
    containerName: 'dogdexx-ai',
    status: 'deployed',
    pid: 3012,
    memory: '124.5 MB',
    uptime: '42d 18h',
    description: 'AI-powered dog breed identification and health record management platform using deep learning image classification (PyTorch) and React/Next.js.',
    repoUrl: 'https://github.com/SILVESTRIKE/DogDexx',
    deployUrl: 'https://dogdexx.vercel.app',
    language: 'TypeScript / PyTorch',
    category: 'ai',
    hasSandbox: true,
    ports: '443:443 -> dogdexx.vercel.app',
    environment: ['FRAMEWORK=Next.js 14', 'MODEL=PyTorch ResNet-50', 'EDGE=Vercel', 'CDN=Cloudinary'],
    dependsOn: ['nextjs-frontend', 'fastapi-inference', 'pytorch-resnet50', 'cloudinary-storage'],
    healthcheck: '[HEALTHY] 94.0% accuracy across 120 breeds (<180ms edge inference)',
    logs: [
      'Serving Next.js edge deployment on vercel.app',
      'Model checkpoint: dog_breed_resnet50_v2.onnx loaded',
      'API endpoint /api/predict latency: 84ms'
    ]
  },
  {
    name: 'doru-ai.service',
    displayName: 'Doru AI - Voice & Desktop Assistant Host Engine',
    image: 'doru-voice-agent:v2.0',
    containerName: 'doru-agent-daemon',
    status: 'running',
    pid: 2145,
    memory: '198.4 MB',
    uptime: '14d 06h',
    description: 'Personal AI desktop assistant running Silero VAD, RepCNN wakeword detector, 8-node LangGraph workflow, Groq/Agnes LLM, and Kokoro TTS on Hyprland.',
    repoUrl: 'https://github.com/SILVESTRIKE/Doru_AI',
    language: 'Python / LangGraph',
    category: 'system',
    hasSandbox: true,
    ports: '8828:8828 (IPC Socket / Unix Domain)',
    environment: ['ENGINE=LangGraph 8-Node', 'VAD=Silero VAD ONNX', 'STT=Whisper', 'LPU=Groq', 'TTS=Piper'],
    dependsOn: ['mic-ringbuffer', 'silero-vad', 'whisper-stt', 'langgraph-orchestrator', 'groq-llm', 'piper-tts'],
    healthcheck: '[HEALTHY] Wakeword "doru" prob: 0.94, full speech-to-speech loop <650ms',
    logs: [
      'Silero VAD ONNX model warmed up in 14ms',
      'LangGraph engine state: IDLE -> LISTENING -> INTENT_ROUTER',
      'Audio capture ring buffer initialized (16000Hz PCM)',
      'Primary LLM: Groq LPU (gpt-oss-20b) healthy'
    ]
  },
  {
    name: 'odoo-erp.service',
    displayName: 'Odoo 18 ERP - Enterprise Business Suite Sandbox',
    image: 'odoo-enterprise:19.0-sandbox',
    containerName: 'odoo-erp-cluster',
    status: 'running',
    pid: 4120,
    memory: '312.0 MB',
    uptime: '5d 11h',
    description: 'Modular enterprise business management system featuring CRM pipeline, Sales quotes, Invoicing, Inventory tracking, and POS register.',
    repoUrl: 'https://github.com/odoo/odoo',
    language: 'Python / PostgreSQL',
    category: 'business',
    hasSandbox: true,
    ports: '8069:8069 (web), 8081:8081 (pgweb)',
    environment: ['CORE=Odoo 19', 'DB_HOST=postgres:5432', 'DB_EXT=pgvector'],
    dependsOn: ['odoo-web', 'odoo-backend', 'postgresql-pgvector:5432', 'pgweb-admin:8081'],
    healthcheck: '[HEALTHY] 48 ERP enterprise modules mounted, CRM/Sales/Inventory online',
    logs: [
      'odoo.modules.loading: 48 modules loaded in 2.14s',
      'odoo.service.server: HTTP service running on 0.0.0.0:8069',
      'odoo.sql_db: PostgreSQL connection pool active (8/16 connections)'
    ]
  },
  {
    name: 'danh-gia-cam-xuc.service',
    displayName: 'DanhGiaCamXuc - Vietnamese Sentiment Analysis',
    image: 'sentiment-nlp:v1.0',
    containerName: 'sentiment-nlp-app',
    status: 'running',
    pid: 2891,
    memory: '154.2 MB',
    uptime: '8d 04h',
    description: 'Vietnamese Sentiment Analysis Streamlit web application running PyTorch and underthesea NLP text segmentation.',
    repoUrl: 'https://github.com/SILVESTRIKE/DanhGiaCamXuc',
    language: 'Python / PyTorch',
    category: 'ai',
    hasSandbox: true,
    ports: '8501:8501 -> streamlit.internal',
    environment: ['FRAMEWORK=Streamlit', 'NLP=underthesea', 'MODEL=PyTorch'],
    dependsOn: ['streamlit-ui', 'underthesea-tokenizer', 'pytorch-lstm'],
    healthcheck: '[HEALTHY] 45,000 vocabulary tokens, 89.2% sentiment accuracy',
    logs: [
      'underthesea tokenizer pipeline loaded',
      'Vietnamese sentiment vocabulary: 42,000 tokens',
      'Streamlit server running on internal port 8501'
    ]
  },
  {
    name: 'document-to-quiz.service',
    displayName: 'document_to_quiz - AI Assessment Generator',
    image: 'document-to-quiz:v1.1',
    containerName: 'doc-quiz-api',
    status: 'running',
    pid: 3410,
    memory: '88.0 MB',
    uptime: '11d 02h',
    description: 'TypeScript and Node.js Express server-side web application and API that parses PDF/DOCX files into interactive quiz sessions using Google Gemini.',
    repoUrl: 'https://github.com/SILVESTRIKE/document_to_quiz',
    language: 'TypeScript / Node.js',
    category: 'ai',
    hasSandbox: true,
    ports: '5000:5000 -> express.internal',
    environment: ['RUNTIME=Node.js', 'PARSER=pdf-parse', 'LLM=Gemini Pro'],
    dependsOn: ['express-api', 'pdf-parser-worker', 'gemini-pro-client'],
    healthcheck: '[HEALTHY] Assessment generation <3.5s per 20-page document',
    logs: [
      'Google Gemini Pro API client initialized',
      'Document parsing queue active (pdf-parse / mammoth)',
      'Express REST API listening on port 5000'
    ]
  },
  {
    name: 'hover-controller.service',
    displayName: 'HoverController - Touchless Gesture & Voice Control',
    image: 'hover-controller:v1.0',
    containerName: 'gesture-vosk-daemon',
    status: 'running',
    pid: 3180,
    memory: '145.0 MB',
    uptime: '4d 09h',
    description: 'Touchless PC gesture and voice interaction interface utilizing Google MediaPipe, OpenCV, and Vosk offline speech recognition.',
    repoUrl: 'https://github.com/SILVESTRIKE/HoverController',
    language: 'Python / OpenCV',
    category: 'system',
    hasSandbox: true,
    ports: 'Local Native IPC Socket',
    environment: ['VISION=OpenCV + MediaPipe', 'SPEECH=Vosk Offline VN'],
    dependsOn: ['camera-stream', 'mediapipe-hands-21-pts', 'vosk-speech-model', 'os-input-driver'],
    healthcheck: '[HEALTHY] 60 FPS 3D hand tracking, touchless desktop input control',
    logs: [
      'MediaPipe Hands pipeline tracking 21 3D landmarks',
      'Vosk offline speech recognition model loaded (vosk-model-small-vn)'
    ]
  },
  {
    name: 'inkwell.service',
    displayName: 'Inkwell - Gemini AI Book-to-Portrait Pipeline',
    image: 'inkwell-ai:v1.0',
    containerName: 'inkwell-diffusion',
    status: 'running',
    pid: 2740,
    memory: '96.2 MB',
    uptime: '7d 15h',
    description: 'Turn any book text into styled character portraits and chapter illustrations using a 5-step Gemini AI pipeline.',
    repoUrl: 'https://github.com/SILVESTRIKE/Inkwell',
    language: 'TypeScript / Gemini',
    category: 'ai',
    hasSandbox: true,
    ports: '3000:3000 -> inkwell.internal',
    environment: ['FRAMEWORK=Next.js', 'LLM=Gemini Vision', 'DIFFUSION=SDXL'],
    dependsOn: ['book-chunker', 'character-extractor', 'prompt-composer', 'diffusion-api'],
    healthcheck: '[HEALTHY] 5-step prompt chaining with character consistency',
    logs: [
      'Character extraction prompt template loaded',
      'Image diffusion style presets: Fantasy, Sci-Fi, Cyberpunk'
    ]
  }
];
