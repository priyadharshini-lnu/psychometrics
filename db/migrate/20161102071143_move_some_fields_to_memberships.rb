class MoveSomeFieldsToMemberships < ActiveRecord::Migration[5.0]
  def self.up
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

  def self.down
    add_column :users, :hris, :jsonb, default: {}
    add_index  :users, :hris, using: :gin
    User.find_each do |user|
      membership = user.memberships.first
      user.update_attributes(membership.slice(:hris, :disabled)) if membership
    end
    remove_timestamps :memberships
    remove_column :memberships, :disabled
    remove_column :memberships, :hris
  end
end
