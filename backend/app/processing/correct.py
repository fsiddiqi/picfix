import cv2
import numpy as np


def auto_color_correct(image: np.ndarray) -> np.ndarray:
    result = image.copy()
    for i in range(3):
        channel = result[:, :, i]
        clipped = np.percentile(channel, (1, 99))
        channel = np.clip(channel, clipped[0], clipped[1])
        span = clipped[1] - clipped[0]
        if span > 0:
            channel = ((channel - clipped[0]) / span * 255).astype(np.uint8)
        else:
            channel = np.full_like(channel, 128, dtype=np.uint8)
        result[:, :, i] = channel

    result = white_balance(result)

    return result


def white_balance(image: np.ndarray) -> np.ndarray:
    result = image.astype(np.float32)
    avg_b = float(np.mean(result[:, :, 0]))
    avg_g = float(np.mean(result[:, :, 1]))
    avg_r = float(np.mean(result[:, :, 2]))
    avg = (avg_b + avg_g + avg_r) / 3.0
    eps = 1e-6
    if avg_b > eps:
        result[:, :, 0] *= avg / avg_b
    if avg_g > eps:
        result[:, :, 1] *= avg / avg_g
    if avg_r > eps:
        result[:, :, 2] *= avg / avg_r
    return np.clip(result, 0, 255).astype(np.uint8)
