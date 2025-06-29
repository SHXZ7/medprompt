import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import pickle

# 1. Load model
model = SentenceTransformer("all-MiniLM-L6-v2")

# 2. FAISS index + metadata store
index = faiss.IndexFlatL2(384)  # 384 = embedding dim
texts = []  # store raw text chunks in memory (or replace with SQLite later)

# 3. Add text chunks
def add_texts_to_index(chunks: list[str]):
    embeddings = model.encode(chunks)
    index.add(np.array(embeddings))
    texts.extend(chunks)

# 4. RAG-style search
def search_similar_chunks(query: str, top_k=3):
    q_embed = model.encode([query])
    distances, indices = index.search(np.array(q_embed), top_k)
    return [texts[i] for i in indices[0]]
