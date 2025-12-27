from argon2 import PasswordHasher

from models.users import User
from sqladmin import ModelView
from markupsafe import Markup

pwd_hasher = PasswordHasher()


def get_password_hash(password: str) -> str:
    """Generate a password hash"""
    return pwd_hasher.hash(password)


def _get_image_src(image_data: str) -> str:
    """
    Takes the raw data from the database and returns a usable src attribute for an <img> tag.
    Handles external URLs, Base64 data, and local file paths.
    """
    if not image_data:
        return ""

    if image_data.startswith("https://") or image_data.startswith("data:image"):
        return image_data
    return image_data


def list_view_image_formatter(model, attribute_name):
    """
    Creates a small thumbnail (40x40) for the list view.
    """
    image_data = getattr(model, attribute_name, None)
    final_image_src = _get_image_src(image_data)

    if not final_image_src:
        return "No Image"

    html = f'<img src="{final_image_src}" width="40" height="40" style="object-fit: cover; border-radius: 4px;">'
    return Markup(html)


def active_formatter(model, attribute_name):
    """
    Renders a Bootstrap badge based on the boolean value.
    """
    is_active = getattr(model, attribute_name, False)

    if is_active:
        html = '<span class="badge rounded-pill bg-success" style="font-size: 0.8em; padding: 6px 10px;">Active</span>'
    else:
        html = '<span class="badge rounded-pill bg-danger" style="font-size: 0.8em; padding: 6px 10px;">Inactive</span>'

    return Markup(html)


class UserAdmin(ModelView, model=User):
    name = "User"
    name_plural = "Users"
    icon = "fa-solid fa-user"
    list_template = "custom_list.html"
    details_template = "custom_details.html"
    edit_template = "custom_edit.html"

    column_list = [
        User.id,
        User.email,
        User.full_name,
        User.is_active,
        User.picture
    ]

    column_details_list = [
        User.id,
        User.email,
        User.full_name,
        User.is_active,
        User.created_at,
        User.last_login,
        User.auth_provider,
        User.hashed_password
    ]

    column_searchable_list = [User.email]

    column_formatters = {
        User.picture: list_view_image_formatter,
        User.is_active: active_formatter
    }

    column_sortable_list = [
        User.id,
        User.email
    ]

    form_columns = [
        User.email,
        User.full_name,
        User.is_active,
        User.hashed_password
    ]

    column_labels = {
        User.full_name: "Full Name",
        User.is_active: "Status",
        User.hashed_password: "Password",
        User.picture: "Avatar"
    }

    async def insert_model(self, request, data):
        """
        Custom logic to hash the password before creating a new User.
        """
        plain_password = data.get("hashed_password")

        if plain_password:
            data["hashed_password"] = get_password_hash(plain_password)
        else:
            raise ValueError("Password is required for new user creation.")

        return await super().insert_model(request, data)

    async def update_model(self, request, pk: str, data):
        """
        Custom logic to hash the password if it's changed during an update.
        """
        plain_password = data.get("hashed_password")

        if plain_password and not plain_password.startswith(
                "$argon2"):
            data["hashed_password"] = get_password_hash(plain_password)

        return await super().update_model(request, pk, data)
