class MoveSomeFieldsToMemberships < ActiveRecord::Migration[5.0]
  def change
    add_column :memberships, :hris, :jsonb, default: {}
    add_index  :memberships, :hris, using: :gin
    add_column :memberships, :disabled, :boolean, default: false
    add_timestamps :memberships, null: true
    User.find_each do |user|
      user.memberships.find_each do |membership|
        membership.update_attributes(user.slice(:hris, :disabled, :created_at, :updated_at))
      end
    end
    change_column :memberships, :created_at, :datetime, null: false
    change_column :memberships, :updated_at, :datetime, null: false
    remove_column :users, :hris, :jsonb
  end
end
