import cv2
import numpy as np
import pytest


@pytest.fixture
def single_photo_image() -> np.ndarray:
    canvas = np.full((800, 1000, 3), 200, dtype=np.uint8)
    x1, y1, x2, y2 = 150, 100, 750, 650
    cv2.rectangle(canvas, (x1, y1), (x2, y2), (120, 100, 80), -1)
    cv2.putText(canvas, "Photo", (300, 400), cv2.FONT_HERSHEY_SIMPLEX, 2, (50, 50, 50), 3)
    return canvas


@pytest.fixture
def multi_photo_image() -> np.ndarray:
    canvas = np.full((900, 1200, 3), 220, dtype=np.uint8)
    cv2.rectangle(canvas, (50, 50), (500, 400), (100, 90, 80), -1)
    cv2.rectangle(canvas, (600, 100), (1100, 500), (130, 120, 110), -1)
    cv2.putText(canvas, "A", (200, 250), cv2.FONT_HERSHEY_SIMPLEX, 2, (30, 30, 30), 3)
    cv2.putText(canvas, "B", (800, 320), cv2.FONT_HERSHEY_SIMPLEX, 2, (30, 30, 30), 3)
    return canvas


@pytest.fixture
def uniform_image() -> np.ndarray:
    return np.full((600, 800, 3), 180, dtype=np.uint8)


@pytest.fixture
def low_light_image() -> np.ndarray:
    canvas = np.full((800, 1000, 3), 25, dtype=np.uint8)
    canvas += np.random.randint(0, 8, canvas.shape, dtype=np.uint8)
    x1, y1, x2, y2 = 200, 150, 700, 600
    cv2.rectangle(canvas, (x1, y1), (x2, y2), (120, 110, 100), -1)
    cv2.putText(canvas, "Dark", (350, 400), cv2.FONT_HERSHEY_SIMPLEX, 1.5, (60, 60, 60), 2)
    return canvas


@pytest.fixture
def color_cast_image() -> np.ndarray:
    canvas = np.full((800, 1000, 3), 180, dtype=np.uint8)
    x1, y1, x2, y2 = 150, 100, 750, 650
    canvas[y1:y2, x1:x2] = (200, 100, 80)
    return canvas
