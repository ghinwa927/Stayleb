from uuid import uuid4

from fastapi import UploadFile
from imagekitio import ImageKit

from app.config import settings


imagekit = ImageKit(
    private_key=settings.imagekit_private_key
)


ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}

MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB


async def upload_property_image(file: UploadFile):

    # Validate image type
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise ValueError(
            "Only JPG, PNG, and WEBP images are allowed"
        )

    # Read image
    file_bytes = await file.read()

    # Validate image size
    if len(file_bytes) > MAX_IMAGE_SIZE:
        raise ValueError(
            "Image size must not exceed 5 MB"
        )

    # Get extension
    extension = (
        file.filename.split(".")[-1]
        if file.filename
        else "jpg"
    )

    # Generate unique filename
    file_name = f"{uuid4()}.{extension}"

    try:
        result = imagekit.files.upload(
            file=file_bytes,
            file_name=file_name,
            folder="/stayleb/properties"
        )

        return {
            "imagekit_file_id": result.file_id,
            "image_url": result.url,
            "file_name": result.name
        }

    except Exception as e:
        print("IMAGEKIT UPLOAD ERROR:", repr(e))

        raise ValueError(
            f"Image upload failed: {str(e)}"
        )


def delete_property_image(file_id: str):
    try:
        imagekit.files.delete(
            file_id=file_id
        )

    except Exception as e:
        print(
            f"IMAGEKIT DELETE ERROR for {file_id}:",
            repr(e)
        )