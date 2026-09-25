/*
Reason for existence: Portfolio metadata and microservice registry representing SILVESTRIKE GitHub repositories as active server services.
System impact if absent: Portfolio services and interactive repository sandboxes will lack catalog data and execution definitions.
*/

import { ServiceUnit } from '@/types';

export const portfolioServices: ServiceUnit[] = [
  {
    name: 'dogdexx.service',
    displayName: 'DogDexx - AI Dog Breed & Health Platform',
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
    logs: [
      'Serving Next.js edge deployment on vercel.app',
      'Model checkpoint: dog_breed_resnet50_v2.onnx loaded',
      'API endpoint /api/predict latency: 84ms'
    ]
  },
  {
    name: 'doru-ai.service',
    displayName: 'Doru AI - Voice & Desktop Assistant Host Engine',
    status: 'running',
    pid: 2145,
    memory: '198.4 MB',
    uptime: '14d 06h',
    description: 'Personal AI desktop assistant running Silero VAD, RepCNN wakeword detector, 8-node LangGraph workflow, Groq/Agnes LLM, and Kokoro TTS on Hyprland.',
    repoUrl: 'https://github.com/SILVESTRIKE/Doru_AI',
    language: 'Python / LangGraph',
    category: 'system',
    hasSandbox: true,
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
    status: 'running',
    pid: 4120,
    memory: '312.0 MB',
    uptime: '5d 11h',
    description: 'Modular enterprise business management system featuring CRM pipeline, Sales quotes, Invoicing, Inventory tracking, and POS register.',
    repoUrl: 'https://github.com/odoo/odoo',
    language: 'Python / PostgreSQL',
    category: 'business',
    hasSandbox: true,
    logs: [
      'odoo.modules.loading: 48 modules loaded in 2.14s',
      'odoo.service.server: HTTP service running on 0.0.0.0:8069',
      'odoo.sql_db: PostgreSQL connection pool active (8/16 connections)'
    ]
  },
  {
    name: 'danh-gia-cam-xuc.service',
    displayName: 'DanhGiaCamXuc - Vietnamese Sentiment Analysis',
    status: 'running',
    pid: 2891,
    memory: '154.2 MB',
    uptime: '8d 04h',
    description: 'Vietnamese Sentiment Analysis Streamlit web application running PyTorch and underthesea NLP text segmentation.',
    repoUrl: 'https://github.com/SILVESTRIKE/DanhGiaCamXuc',
    language: 'Python / PyTorch',
    category: 'ai',
    hasSandbox: true,
    logs: [
      'underthesea tokenizer pipeline loaded',
      'Vietnamese sentiment vocabulary: 42,000 tokens',
      'Streamlit server running on internal port 8501'
    ]
  },
  {
    name: 'document-to-quiz.service',
    displayName: 'document_to_quiz - AI Assessment Generator',
    status: 'running',
    pid: 3410,
    memory: '88.0 MB',
    uptime: '11d 02h',
    description: 'TypeScript and Node.js Express server-side web application and API that parses PDF/DOCX files into interactive quiz sessions using Google Gemini.',
    repoUrl: 'https://github.com/SILVESTRIKE/document_to_quiz',
    language: 'TypeScript / Node.js',
    category: 'ai',
    hasSandbox: true,
    logs: [
      'Google Gemini Pro API client initialized',
      'Document parsing queue active (pdf-parse / mammoth)',
      'Express REST API listening on port 5000'
    ]
  },
  {
    name: 'toi-uu-gia.service',
    displayName: 'Toi_Uu_Gia - Demand Price Elasticity Optimizer',
    status: 'running',
    pid: 2650,
    memory: '92.4 MB',
    uptime: '6d 14h',
    description: 'Streamlit application to evaluate price elasticity of demand and optimize retail and combo menu pricing using regression models.',
    repoUrl: 'https://github.com/SILVESTRIKE/Toi_Uu_Gia',
    language: 'Python / Jupyter',
    category: 'business',
    hasSandbox: true,
    logs: [
      'OLS demand elasticity regression model fitted (R2 = 0.884)',
      'Profit maximization solver initialized'
    ]
  },
  {
    name: 'product-manager.service',
    displayName: 'ProductManager - Express.js REST API Backend',
    status: 'running',
    pid: 2420,
    memory: '42.8 MB',
    uptime: '19d 08h',
    description: 'Express.js backend REST API providing CRUD operations, schema validation, and catalog endpoints for product inventory.',
    repoUrl: 'https://github.com/SILVESTRIKE/ProductManager',
    language: 'JavaScript / Express',
    category: 'web',
    hasSandbox: true,
    logs: [
      'Express route registered: GET /api/products',
      'Express route registered: POST /api/products',
      'MongoDB client connected to cluster0'
    ]
  },
  {
    name: 'samco-binhtan.service',
    displayName: 'samco-binhtan-webapp - Auto Dealership Portal',
    status: 'running',
    pid: 1980,
    memory: '64.0 MB',
    uptime: '12d 20h',
    description: 'Dealership web portal and client-side e-commerce front-end for SAMCO Binh Tan auto showroom built using React, Vite, and Tailwind CSS.',
    repoUrl: 'https://github.com/SILVESTRIKE/samco-binhtan-webapp',
    language: 'TypeScript / React',
    category: 'web',
    hasSandbox: true,
    logs: [
      'Vite SPA static build loaded into NGINX web root',
      'Product catalog: 18 vehicle models indexed'
    ]
  },
  {
    name: 'hover-controller.service',
    displayName: 'HoverController - Touchless Gesture & Voice Control',
    status: 'running',
    pid: 3180,
    memory: '145.0 MB',
    uptime: '4d 09h',
    description: 'Touchless PC gesture and voice interaction interface utilizing Google MediaPipe, OpenCV, and Vosk offline speech recognition.',
    repoUrl: 'https://github.com/SILVESTRIKE/HoverController',
    language: 'Python / OpenCV',
    category: 'system',
    hasSandbox: true,
    logs: [
      'MediaPipe Hands pipeline tracking 21 3D landmarks',
      'Vosk offline speech recognition model loaded (vosk-model-small-vn)'
    ]
  },
  {
    name: 'inkwell.service',
    displayName: 'Inkwell - Gemini AI Book-to-Portrait Pipeline',
    status: 'running',
    pid: 2740,
    memory: '96.2 MB',
    uptime: '7d 15h',
    description: 'Turn any book text into styled character portraits and chapter illustrations using a 5-step Gemini AI pipeline.',
    repoUrl: 'https://github.com/SILVESTRIKE/Inkwell',
    language: 'TypeScript / Gemini',
    category: 'ai',
    hasSandbox: true,
    logs: [
      'Character extraction prompt template loaded',
      'Image diffusion style presets: Fantasy, Sci-Fi, Cyberpunk'
    ]
  }
];
