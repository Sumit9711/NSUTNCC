"""
NSUT NCC — Application Configuration
Environment variables override defaults.
"""
import os


class Config:
    # Flask
    SECRET_KEY = os.environ.get('SECRET_KEY', 'ncc-dev-secret-change-in-production')

    # MySQL
    DB_HOST = os.environ.get('DB_HOST', 'localhost')
    DB_USER = os.environ.get('DB_USER', 'root')
    DB_PASSWORD = os.environ.get('DB_PASSWORD', 'admin')
    DB_NAME = os.environ.get('DB_NAME', 'nsut_ncc')

    # Mail (for password reset)
    MAIL_SERVER = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
    MAIL_PORT = int(os.environ.get('MAIL_PORT', 587))
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME', '')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD', '')
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER', '')

    # Auth
    ADMIN_DLI = 'DL2024SDIA1440189'
    RESET_TOKEN_EXPIRY_MINUTES = 15
