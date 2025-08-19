import secrets
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request

from core.config import settings

ADMIN_USERNAME = settings.ADMIN_USERNAME
ADMIN_PASSWORD = settings.ADMIN_PASSWORD
ADMIN_SECRET_KEY = settings.ADMIN_SECRET_KEY


class MyAuthBackend(AuthenticationBackend):
    async def login(self, request: Request) -> bool:
        form_data = await request.form()
        username = form_data.get("username")
        password = form_data.get("password")

        if not (username and password):
            return False

        correct_username = secrets.compare_digest(username, ADMIN_USERNAME)
        correct_password = secrets.compare_digest(password, ADMIN_PASSWORD)

        if correct_username and correct_password:
            request.session.update({"token": "admin_authenticated"})
            return True

        return False

    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True

    async def authenticate(self, request: Request) -> bool:
        return "token" in request.session


authentication_backend = MyAuthBackend(secret_key=ADMIN_SECRET_KEY)
