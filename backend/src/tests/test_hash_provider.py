import pytest
from infrastructure.security.hash_provider import HashProvider

def test_verify_password_correct():
    password = "secret_password"
    hashed = HashProvider.get_password_hash(password)
    assert HashProvider.verify_password(password, hashed) is True

def test_verify_password_incorrect():
    password = "secret_password"
    wrong_password = "wrong_password"
    hashed = HashProvider.get_password_hash(password)
    assert HashProvider.verify_password(wrong_password, hashed) is False

def test_hashed_password_is_different_from_plain():
    password = "secret_password"
    hashed = HashProvider.get_password_hash(password)
    assert hashed != password
