import cv2
import numpy as np

from app.processing.models import DetectedRegion, Point


def detect_photo_regions(image: np.ndarray) -> list[DetectedRegion]:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    edged = cv2.Canny(blurred, 30, 100)
    dilated = cv2.dilate(edged, None, iterations=2)
    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    if not contours:
        return []

    regions: list[DetectedRegion] = []
    h, w = gray.shape
    img_area = h * w

    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < img_area * 0.01:
            continue

        peri = cv2.arcLength(cnt, True)
        approx = cv2.approxPolyDP(cnt, 0.02 * peri, True)

        if len(approx) == 4:
            corners = approx
        else:
            rect = cv2.minAreaRect(cnt)
            corners = cv2.boxPoints(rect)
            corners = np.int32(corners)

        corners_list = sorted(
            [Point(x=float(pt[0][0]), y=float(pt[0][1])) for pt in corners.reshape(-1, 1, 2)],
            key=lambda p: (p.y, p.x),
        )

        confidence = min(1.0, area / (img_area * 0.05))

        regions.append(DetectedRegion(corners=corners_list, confidence=round(confidence, 4)))

    return regions
