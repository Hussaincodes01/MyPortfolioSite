// Single source of truth — mirrors JiyadNewResume.pdf. Update here, not in components.

export const profile = {
  first: 'Jiyad',
  last: 'Hussain',
  role: 'AI / ML Engineer',
  focus: 'Computer vision · NLP · Model deployment',
  location: 'New Delhi, India',
  email: 'hussainbased@gmail.com',
  phone: '+91 99836 92606',
  github: 'https://github.com/Hussaincodes01',
  githubHandle: 'Hussaincodes01',
  linkedin: 'https://www.linkedin.com/in/jiyad-hussain-50379134b/',
  statement:
    'I build vision and language models that hold up outside the notebook — defect detection that survives bad factory lighting, translation pipelines for a language nobody has spoken in two thousand years.',
  secondary:
    'Computer Science undergraduate at Amity University Noida, graduating 2028. I work in Python and C++ across PyTorch and TensorFlow, and I care about the part most people skip: getting the model to run somewhere real. Off the clock I cook, play football, and lose evenings to video games.',
}

export const heroMetrics = [
  { value: '11', label: 'defect classes' },
  { value: '35+', label: 'chrF++ score' },
  { value: 'Top 10', label: 'Kaggle finish' },
]

export type Project = {
  id: string
  title: string
  subtitle: string
  status: 'ongoing' | 'shipped'
  period: string
  summary: string
  detail: string[]
  metrics: { value: string; label: string }[]
  stack: string[]
}

export const projects: Project[] = [
  {
    id: 'pcb',
    title: 'Bi-Directional Surface Defect Recognition in PCBs',
    subtitle: 'With geometric and photometric priors',
    status: 'ongoing',
    period: 'Feb 2026 — present',
    summary:
      'Factory inspection cameras fail when the lighting changes. This is a tri-modal YOLOv5 that reads RGB, depth, and illumination at once, so a solder bridge looks like a solder bridge under any lamp on the line.',
    detail: [
      'Novel tri-modal YOLOv5 architecture for bi-directional PCB defect detection, processing RGB, depth, and illumination streams simultaneously through dedicated encoders fused by an attention-based mechanism.',
      'Curated a 1,500-instance dataset across 11 defect classes covering both top-surface and back-side boards, synthesising depth and illumination maps with Intel MiDaS-Small to capture geometric and photometric priors — no physical 3D sensors required.',
      'Built a class-aware augmentation pipeline applying geometric and photometric transforms to underrepresented classes while mathematically keeping YOLO bounding boxes in sync, eliminating annotation drift and balancing all 11 categories.',
      'Addresses a real gap in automated inspection: robust detection under variable industrial lighting. Next up is class-weighted loss optimisation and deployment to edge hardware.',
    ],
    metrics: [
      { value: '3', label: 'fused modalities' },
      { value: '1,500', label: 'annotated instances' },
      { value: '11', label: 'defect classes' },
    ],
    stack: ['PyTorch', 'YOLOv5', 'Intel MiDaS', 'OpenCV', 'Albumentations'],
  },
  {
    id: 'akkadian',
    title: 'Akkadian to English Translation',
    subtitle: 'Byte-level transformers on cuneiform',
    status: 'shipped',
    period: 'Dec 2025',
    summary:
      'Akkadian transliterations are full of diacritics and broken tokens that wreck a normal tokeniser. Going byte-level sidesteps the vocabulary problem entirely.',
    detail: [
      'ByT5-based Akkadian→English translation pipeline for the Deep Past Kaggle challenge, reaching a chrF++ score above 35 on the public leaderboard.',
      'Implemented a custom bucketed batching strategy grouping samples by length, cutting padding waste and measurably improving inference speed and GPU utilisation.',
      'Built a vectorised post-processing module in pandas and regex to normalise transliterations, strip repeated n-grams, and repair punctuation — cleaner, more consistent output.',
      'Automated the whole submission path: data loading, inference, post-processing, and CSV export in one reproducible script ready for direct upload.',
    ],
    metrics: [
      { value: '35+', label: 'chrF++ public LB' },
      { value: 'ByT5', label: 'base model' },
      { value: '0', label: 'manual steps to submit' },
    ],
    stack: ['ByT5', 'Transformers', 'HuggingFace', 'pandas', 'PyTorch'],
  },
  {
    id: 'extremism',
    title: 'Social Media Extremism Text Detection',
    subtitle: 'Classical NLP, held to an F1 bar',
    status: 'shipped',
    period: 'Dec 2025',
    summary:
      'Real social text is emoji, slang, and duplicate spam. Most of the work here was cleaning, not modelling — and it is what moved the F1 on the class that actually matters.',
    detail: [
      'NLP pipeline turning raw social-media text into numerical features — TF-IDF n-grams and word embeddings — feeding supervised classifiers that separate extremist from benign content.',
      'Data cleaning workflow covering lowercasing, stopword removal, tokenisation, emoji and URL stripping, de-duplication, and slang normalisation to lift signal-to-noise on messy real-world text.',
      'Benchmarked multinomial Naive Bayes, SVM, logistic regression, random forest, and XGBoost, selecting on F1 for the extremist class against a held-out validation set rather than raw accuracy.',
      'Finished in the top 10 of the Kaggle competition.',
    ],
    metrics: [
      { value: 'Top 10', label: 'Kaggle leaderboard' },
      { value: '5', label: 'algorithms benchmarked' },
      { value: 'F1', label: 'selection metric' },
    ],
    stack: ['Scikit-Learn', 'XGBoost', 'NLTK', 'TF-IDF', 'pandas'],
  },
]

export const skillGroups: {
  label: string
  items: string[]
  note?: string
}[] = [
  {
    label: 'Languages',
    items: ['Python', 'C++'],
    note: 'Python for everything model-side. C++ when the inference path has to be tight.',
  },
  {
    label: 'Deep learning',
    items: ['PyTorch', 'TensorFlow', 'Transformers', 'HuggingFace', 'ONNX'],
  },
  {
    label: 'Vision & data',
    items: [
      'OpenCV',
      'Albumentations',
      'NumPy',
      'Pandas',
      'Pillow',
      'Matplotlib',
      'Seaborn',
    ],
  },
  {
    label: 'Classical ML',
    items: ['Scikit-Learn', 'XGBoost', 'LightGBM', 'NLTK'],
  },
  {
    label: 'Deployment',
    items: ['Docker', 'Kubernetes', 'FastAPI', 'Streamlit', 'MLflow', 'Git'],
  },
  {
    label: 'Tracking & tooling',
    items: ['Weights & Biases', 'tqdm', 'YAML', 'Pathlib', 'VS Code'],
  },
]

export const education = {
  degree: 'B.Tech, Computer Science',
  school: 'Amity University, Noida',
  grade: 'CGPA 8.0',
  graduating: 'Graduating 2028',
}

export const certification = {
  name: 'Fundamentals of Deep Learning',
  issuer: 'NVIDIA',
  issued: 'Issued October 2025',
  credential: '1tO0Ys3ITkGJkXM3sgBKrQ',
}

export const interests = [
  'Cooking',
  'Football',
  'Video games',
  'Wisdom exchange',
]
