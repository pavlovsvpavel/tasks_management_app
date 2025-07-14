from starlette.responses import Response
from core.config import AuthCookieSettings, CsrfCookieSettings


class CookieManager:
    def __init__(self, response: Response):
        self.response = response

    def set_auth(self, token: str):
        self.response.set_cookie(
            key="access_token",
            value=f"Bearer {token}",
            **AuthCookieSettings().model_dump()
        )

    def set_csrf(self, csrf_token: str):
        self.response.set_cookie(
            key="csrf_token",
            value=csrf_token,
            **CsrfCookieSettings().model_dump()
        )
