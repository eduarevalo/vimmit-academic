import pytest
from unittest.mock import MagicMock, patch
import io
from uuid import uuid4
from sqlmodel import Session

from infrastructure.storage.s3 import S3StorageService
from application.shared.attachment_service import AttachmentService
from domain.shared.attachments import AttachmentModel

@pytest.fixture
def mock_s3_client():
    with patch('boto3.session.Session.client') as mock_client:
        yield mock_client()

@pytest.fixture
def storage_service(mock_s3_client):
    # Mock settings before init
    with patch('infrastructure.storage.s3.get_settings') as mock_settings:
        mock_settings.return_value.SPACES_BUCKET = "test-bucket"
        mock_settings.return_value.SPACES_REGION = "nyc3"
        mock_settings.return_value.SPACES_ENDPOINT = "https://nyc3.digitaloceanspaces.com"
        mock_settings.return_value.SPACES_ACCESS_ID = "key"
        mock_settings.return_value.SPACES_SECRET_KEY = "secret"
        
        service = S3StorageService()
        yield service

def test_upload_file(storage_service, mock_s3_client):
    file_obj = io.BytesIO(b"test data")
    key = "test/file.txt"
    content_type = "text/plain"
    
    storage_service.upload_file(file_obj, key, content_type)
    
    mock_s3_client.upload_fileobj.assert_called_once()
    args, kwargs = mock_s3_client.upload_fileobj.call_args
    assert args[1] == "test-bucket"
    assert args[2] == key
    assert kwargs['ExtraArgs']['ContentType'] == content_type

def test_get_download_url(storage_service, mock_s3_client):
    key = "test/file.txt"
    mock_s3_client.generate_presigned_url.return_value = "https://signed-url.com"
    
    url = storage_service.get_download_url(key)
    
    assert url == "https://signed-url.com"
    mock_s3_client.generate_presigned_url.assert_called_once_with(
        'get_object',
        Params={'Bucket': 'test-bucket', 'Key': key},
        ExpiresIn=3600
    )

@pytest.mark.anyio
async def test_attachment_service_upload():
    # Mocking storage and session
    mock_storage = MagicMock()
    mock_storage.upload_file.return_value = "tenant-id/misc/uuid_test.txt"
    
    mock_session = MagicMock(spec=Session)
    
    service = AttachmentService(session=mock_session, storage=mock_storage)
    
    tenant_id = uuid4()
    file_obj = io.BytesIO(b"content")
    
    attachment = await service.upload_attachment(
        tenant_id=tenant_id,
        file_name="test.txt",
        file_obj=file_obj,
        content_type="text/plain",
        size=7,
        entity_type="LEAD"
    )
    
    assert attachment.file_name == "test.txt"
    assert attachment.tenant_id == tenant_id
    assert attachment.entity_type == "LEAD"
    assert mock_storage.upload_file.called
    assert mock_session.add.called
    assert mock_session.commit.called
