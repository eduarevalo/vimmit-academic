from typing import Protocol, BinaryIO, Optional
from uuid import UUID

class StorageServiceInterface(Protocol):
    """
    Interface for storage services following S3-like operations.
    """
    
    def upload_file(
        self, 
        file_obj: BinaryIO, 
        key: str, 
        content_type: str, 
        is_public: bool = False
    ) -> str:
        """
        Uploads a file to the storage and returns the key/path.
        """
        ...

    def get_download_url(self, key: str, expires_in: int = 3600) -> str:
        """
        Generates a temporary signed URL for downloading a private file.
        """
        ...

    def delete_file(self, key: str) -> bool:
        """
        Deletes a file from the storage.
        """
        ...
