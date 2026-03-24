import bcrypt

class HashProvider:
    """
    Handles password hashing and verification using the native bcrypt library.
    Avoids passlib legacy issues with long passwords/new bcrypt versions.
    """

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'), 
            hashed_password.encode('utf-8')
        )

    @staticmethod
    def get_password_hash(password: str) -> str:
        # bcrypt.hashpw returns bytes, so we decode to store as string
        return bcrypt.hashpw(
            password.encode('utf-8'), 
            bcrypt.gensalt()
        ).decode('utf-8')
