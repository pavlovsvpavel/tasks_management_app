import os
import streamlit as st
from ui.users import user_create_form, user_list_panel
from dotenv import load_dotenv

load_dotenv()

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")

st.set_page_config(page_title="Admin Panel", layout="centered")

# Session state: store login
if "logged_in" not in st.session_state:
    st.session_state.logged_in = False

# Login form
if not st.session_state.logged_in:
    st.title("🔐 Admin Login")
    with st.form("login"):
        username = st.text_input("Username")
        password = st.text_input("Password", type="password")
        submitted = st.form_submit_button("Login")
        if submitted:
            if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
                st.session_state.logged_in = True
                st.success("✅ Logged in")
            else:
                st.error("❌ Invalid credentials")
    st.stop()

# Admin interface
st.title("User Management")
user_create_form()
st.markdown("---")
user_list_panel()
