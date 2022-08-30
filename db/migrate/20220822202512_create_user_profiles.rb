# frozen_string_literal: true

class CreateUserProfiles < ActiveRecord::Migration[6.1]
  def up
    create_table :user_profiles do |t|
      t.integer :age
      t.datetime :age_updated_at
      t.integer :gender
      t.string :timezone
      t.string :photo
      t.string :locale
      t.json :custom_fields

      t.timestamps
    end
    add_reference :user_profiles, :user, foreign_key: { on_delete: :cascade }, null: false

    User.find_each { |user| user.create_user_profile(photo: user.photo) }
  end

  def down
    remove_reference :user_profiles, :user
    drop_table :user_profiles
  end
end
