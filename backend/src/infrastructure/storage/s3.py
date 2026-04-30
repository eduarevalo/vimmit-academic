import io
import boto3
from botocore.config import Config
from typing import BinaryIO, Optional, Union
from infrastructure.config.settings import get_settings
from infrastructure.storage.protocol import StorageServiceInterface

class S3StorageService(StorageServiceInterface):
    """
    Implementation of StorageServiceInterface using boto3 (compatible with AWS S3 and DigitalOcean Spaces).
    """
    def __init__(self):
        settings = get_settings()
        self.bucket = settings.SPACES_BUCKET
        self.region = settings.SPACES_REGION
        self.endpoint_url = settings.SPACES_ENDPOINT
        
        # We session-ize the client for better thread safety and configuration
        session = boto3.session.Session()
        self.client = session.client(
            's3',
            region_name=self.region,
            endpoint_url=self.endpoint_url,
            aws_access_key_id=settings.SPACES_ACCESS_ID,
            aws_secret_access_key=settings.SPACES_SECRET_KEY,
            config=Config(signature_version='s3v4')
        )

    def upload_file(
        self, 
        file_obj: Union[BinaryIO, bytes], 
        key: str, 
        content_type: str, 
        is_public: bool = False
    ) -> str:
        """
        Uploads a file to the configured Space/Bucket.
        """
        if not self.bucket:
            raise ValueError("SPACES_BUCKET is not configured")

        # Handle raw bytes by wrapping them in a file-like object
        if isinstance(file_obj, bytes):
            file_obj = io.BytesIO(file_obj)

        extra_args = {'ContentType': content_type}
        if is_public:
            extra_args['ACL'] = 'public-read'
            
        self.client.upload_fileobj(
            file_obj,
            self.bucket,
            key,
            ExtraArgs=extra_args
        )
        return key

    def get_download_url(self, key: str, expires_in: int = 3600) -> str:
        """
        Generates a temporary signed URL for downloading a private file.
        """
        if not self.bucket:
            raise ValueError("SPACES_BUCKET is not configured")

        return self.client.generate_presigned_url(
            'get_object',
            Params={'Bucket': self.bucket, 'Key': key},
            ExpiresIn=expires_in
        )

    def delete_file(self, key: str) -> bool:
        """
        Deletes a file from the bucket.
        """
        if not self.bucket:
            raise ValueError("SPACES_BUCKET is not configured")

        try:
            self.client.delete_object(Bucket=self.bucket, Key=key)
            return True
        except Exception as e:
            # We log the error but return false to inform the caller
            print(f"Error deleting file from S3/Spaces: {e}")
            return False
