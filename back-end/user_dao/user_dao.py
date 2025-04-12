def get_all_users(db):
    try:
        all_users = []

        families_ref = db.collection('families')
        families = families_ref.stream()

        for family in families:
            family_name = family.id
            users_ref = families_ref.document(family_name).collection('users')

            users = users_ref.stream()
            for user in users:
                user_data = user.to_dict()
                user_data['family'] = family_name
                user_data['userName'] = user.id

                all_users.append(user_data)

        return all_users

    except Exception as e:
        print(f"Error retrieving users: {e}")
        return []