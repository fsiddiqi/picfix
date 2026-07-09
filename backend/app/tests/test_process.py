import io

import cv2
import numpy as np
import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _encode_image(img: np.ndarray) -> bytes:
    _, buffer = cv2.imencode(".jpg", img)
    return buffer.tobytes()


class TestProcessEndpoint:
    def test_health(self):
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json() == {"status": "ok"}

    def test_process_single_photo(self, single_photo_image):
        data = _encode_image(single_photo_image)
        resp = client.post("/process", files={"file": ("test.jpg", data, "image/jpeg")})
        assert resp.status_code == 200
        assert "X-Regions" in resp.headers
        assert resp.headers["content-type"] == "image/jpeg"

    def test_process_multi_photo(self, multi_photo_image):
        data = _encode_image(multi_photo_image)
        resp = client.post("/process", files={"file": ("test.jpg", data, "image/jpeg")})
        assert resp.status_code == 200
        import json
        regions = json.loads(resp.headers["X-Regions"])["regions"]
        assert len(regions) >= 2

    def test_process_uniform_returns_empty_regions(self, uniform_image):
        data = _encode_image(uniform_image)
        resp = client.post("/process", files={"file": ("test.jpg", data, "image/jpeg")})
        assert resp.status_code == 200
        import json
        regions = json.loads(resp.headers["X-Regions"])["regions"]
        assert len(regions) == 0

    def test_empty_file_returns_400(self):
        resp = client.post("/process", files={"file": ("empty.jpg", b"", "image/jpeg")})
        assert resp.status_code == 400

    def test_invalid_file_returns_400(self):
        resp = client.post("/process", files={"file": ("bad.txt", b"not an image", "text/plain")})
        assert resp.status_code == 400

    def test_corrected_image_is_different_from_input(self, low_light_image):
        data = _encode_image(low_light_image)
        resp = client.post("/process", files={"file": ("test.jpg", data, "image/jpeg")})
        assert resp.status_code == 200
        original_bytes = data
        assert resp.content != original_bytes
