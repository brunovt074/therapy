class InvalidCredentialsError(Exception):
    def __init__(self):
        super().__init__("Invalid email or password")
