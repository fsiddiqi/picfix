from io import BytesIO

import cv2
import numpy as np
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import Response

from app.processing.correct import auto_color_correct
from app.processing.detect import detect_photo_regions
from app.processing.models import ProcessResponse

router = APIRouter()


@router.post("/process")
async def process_image(file: UploadFile = File(...)):
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Empty file")

    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(status_code=400, detail="Could not decode image")

    corrected = auto_color_correct(image)
    regions = detect_photo_regions(corrected)

    _, buffer = cv2.imencode(".jpg", corrected, [cv2.IMWRITE_JPEG_QUALITY, 92])
    return Response(
        content=BytesIO(buffer.tobytes()).getvalue(),
        media_type="image/jpeg",
        headers={
            "X-Regions": ProcessResponse(regions=regions).model_dump_json(),
        },
    )
