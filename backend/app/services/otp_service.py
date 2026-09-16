import secrets
from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()


def generate_otp() -> str:
    return str(secrets.randbelow(900000) + 100000)


def hash_otp(otp: str) -> str:
    return password_hash.hash(otp)


def verify_otp(plain_otp: str, hashed_otp: str) -> bool:
    return password_hash.verify(plain_otp, hashed_otp)