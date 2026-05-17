class InvalidTokenError(Exception):
    def __init__(self):
        super().__init__("Invalid or expired token")
