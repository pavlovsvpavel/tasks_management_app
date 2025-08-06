import streamlit as st
from services.users import create_user, load_users, update_user, delete_user


def user_create_form():
    with st.expander("Create User"):
        with st.form("create_user_form"):
            email = st.text_input("Email")
            password = st.text_input("Password", type="password")
            full_name = st.text_input("Full Name (optional)")
            submit = st.form_submit_button("Create")
            if submit:
                create_user(email, password, full_name)
                # st.rerun()


def user_list_panel():
    users = load_users()

    st.title("List of users")
    for user in users:
        with st.expander(f"{user['email']}"):
            st.write(f"**Full Name:** {user.get('full_name') or 'N/A'}")
            st.write(f"**Verified:** {user.get('is_verified')}")
            st.write(f"**Created At:** {user.get('created_at')}")
            st.write(f"**Last Login:** {user.get('last_login')}")
            st.write(f"**Picture:**")
            if user.get("picture"):
                st.image(user["picture"], width=100)
            else:
                st.write("No picture uploaded")

            is_active = st.checkbox(
                "Active",
                value=user.get("is_active", False),
                key=f"active_{user['id']}"
            )

            col_pass, _ = st.columns([4, 4])
            with col_pass:
                new_pass = st.text_input(
                    "New Password",
                    type="password",
                    key=f"pw_{user['id']}"
                )

            col_left, col_spacer, col_right = st.columns([3, 13, 3])
            with col_left:
                update_btn = st.button("Update", key=f"update_{user['id']}")
            with col_right:
                delete_btn = st.button("❌ Delete", key=f"delete_{user['id']}")

            if update_btn:
                update_user(user["id"], is_active, new_pass if new_pass else None)
                # st.rerun()

            if delete_btn:
                delete_user(user["id"])
                # st.rerun()
