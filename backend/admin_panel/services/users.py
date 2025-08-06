import os
import requests
import streamlit as st
from dotenv import load_dotenv

load_dotenv()

ADMIN_API_URL = os.getenv("ADMIN_API_URL")
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN")
NGINX_APP_KEY = os.getenv("NGINX_APP_KEY")

HEADERS = {
    "X-Admin-Token": ADMIN_TOKEN,
    "X-App-Key": NGINX_APP_KEY,
}


def load_users():
    res = requests.get(f"{ADMIN_API_URL}/admin/users", headers=HEADERS)
    return res.json() if res.ok else []


def create_user(email, password, full_name):
    data = {"email": email, "password": password, "full_name": full_name}
    response = requests.post(f"{ADMIN_API_URL}/admin/users/create", json=data, headers=HEADERS)

    if response.status_code == 200:
        st.success("✅ User created successfully!")
        return response
    else:
        st.error(f"❌ Failed to create user: {response.text}")
        return None


def update_user(user_id, is_active, new_password):
    data = {"is_active": is_active}
    if new_password:
        data["new_password"] = new_password

    response = requests.patch(f"{ADMIN_API_URL}/admin/users/{user_id}", json=data, headers=HEADERS)

    if response.status_code == 200:
        st.success("✅ User updated successfully!")
        return response
    else:
        st.error(f"❌ Failed to update user: {response.text}")
        return None


def delete_user(user_id):
    response = requests.delete(f"{ADMIN_API_URL}/admin/users/{user_id}", headers=HEADERS)

    if response.status_code == 200:
        st.success("✅ User deleted successfully!")
        return response
    else:
        st.error(f"❌ Failed to delete user: {response.text}")
        return None
