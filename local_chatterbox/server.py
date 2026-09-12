"""Local Chatterbox TTS server - a free, CPU-only stand-in for the Modal
deployment (chatterbox_tts.py). Matches that endpoint's request/response
contract exactly, so the Next.js app just needs CHATTERBOX_API_URL pointed
at this server (e.g. your Cloudflare Tunnel URL) - no other changes.

Setup:
  pip install boto3 python-dotenv

Copy local_chatterbox/.env.example to local_chatterbox/.env and fill in
the same S3_* values and a CHATTERBOX_API_KEY already used by the Next.js
app's .env (see project root .env / .env.example).

Run:
  uvicorn server:app --host 0.0.0.0 --port 8000
"""

import io
import os
from pathlib import Path

import boto3
import soundfile as sf
import torch
from chatterbox.tts_turbo import ChatterboxTurboTTS
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Security
from fastapi.responses import StreamingResponse
from fastapi.security import APIKeyHeader
from pydantic import BaseModel, Field

load_dotenv()

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

s3 = boto3.client(
    "s3",
    region_name=os.environ["S3_REGION"],
    aws_access_key_id=os.environ["S3_ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["S3_SECRET_ACCESS_KEY"],
)
S3_BUCKET_NAME = os.environ["S3_BUCKET_NAME"]

api_key_scheme = APIKeyHeader(name="x-api-key", auto_error=False)


def verify_api_key(x_api_key: str | None = Security(api_key_scheme)):
    expected = os.environ.get("CHATTERBOX_API_KEY", "")
    if not expected or x_api_key != expected:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return x_api_key


class TTSRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=5000)
    voice_key: str = Field(..., min_length=1, max_length=300)
    temperature: float = Field(default=0.8, ge=0.0, le=2.0)
    top_p: float = Field(default=0.95, ge=0.0, le=1.0)
    top_k: int = Field(default=1000, ge=1, le=10000)
    repetition_penalty: float = Field(default=1.2, ge=1.0, le=2.0)
    norm_loudness: bool = Field(default=True)


app = FastAPI(
    title="Local Chatterbox TTS",
    dependencies=[Depends(verify_api_key)],
)

model: ChatterboxTurboTTS | None = None


@app.on_event("startup")
def load_model():
    global model
    print(f"Loading Chatterbox on {DEVICE} (this can take a while on CPU)...")
    model = ChatterboxTurboTTS.from_pretrained(device=DEVICE)
    print("Model loaded.")


@app.post("/generate", responses={200: {"content": {"audio/wav": {}}}})
def generate_speech(request: TTSRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Model is still loading")

    local_voice_path = Path("/tmp/chatterbox-voices") / request.voice_key
    local_voice_path.parent.mkdir(parents=True, exist_ok=True)

    if not local_voice_path.exists():
        try:
            s3.download_file(S3_BUCKET_NAME, request.voice_key, str(local_voice_path))
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Voice not found at '{request.voice_key}': {e}",
            )

    try:
        wav = model.generate(
            request.prompt,
            audio_prompt_path=str(local_voice_path),
            temperature=request.temperature,
            top_p=request.top_p,
            top_k=request.top_k,
            repetition_penalty=request.repetition_penalty,
            norm_loudness=request.norm_loudness,
        )

        buffer = io.BytesIO()
        sf.write(buffer, wav.squeeze(0).cpu().numpy(), model.sr, format="WAV")
        buffer.seek(0)

        return StreamingResponse(buffer, media_type="audio/wav")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate audio: {e}")
