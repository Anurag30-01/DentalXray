# utils.py
import pydicom
import numpy as np
from PIL import Image
import io

def dicom_to_png_bytes(dicom_bytes: bytes) -> bytes:
    ds = pydicom.dcmread(io.BytesIO(dicom_bytes))
    arr = ds.pixel_array

    # Normalize to 0–255
    arr = arr.astype(np.float32)
    arr -= arr.min()
    arr /= arr.max()
    arr *= 255
    arr = arr.astype(np.uint8)

    image = Image.fromarray(arr).convert("L")  # Convert to grayscale
    buf = io.BytesIO()
    image.save(buf, format="PNG")
    buf.seek(0)
    return buf.read()
