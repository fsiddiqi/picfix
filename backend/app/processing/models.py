from pydantic import BaseModel


class Point(BaseModel):
    x: float
    y: float


class DetectedRegion(BaseModel):
    corners: list[Point]
    confidence: float


class ProcessResponse(BaseModel):
    regions: list[DetectedRegion]
