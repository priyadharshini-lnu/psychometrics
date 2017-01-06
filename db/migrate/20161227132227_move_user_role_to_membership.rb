class MoveUserRoleToMembership < ActiveRecord::Migration[5.0]
  USER_DEFAULT_ROLE_NEW = 'Users::Regular'.freeze
  MEMBERSHIP_DEFAULT_ROLE = 'member'.freeze
  # roles in priority order
  EXTRA_USER_ROLES = %w(Users::Admin Users::Manager Users::Member).freeze
  MEMBERSHIP_ROLES = %w(admin manager member).freeze

  def up
    add_column :memberships, :role, :string, default: MEMBERSHIP_DEFAULT_ROLE
    User.inheritance_column = nil
    User.includes(:memberships).find_each do |user|
      if EXTRA_USER_ROLES.include? user.role
        role_index = EXTRA_USER_ROLES.index user.role
        user.role = USER_DEFAULT_ROLE_NEW
        user.save!(validate: false)
        user.memberships.each { |m| m.role = MEMBERSHIP_ROLES[role_index]; m.save!(validate: false) }
      end
    end
    change_column_default :users, :role, USER_DEFAULT_ROLE_NEW
  end

  def down
    raise "No way back"
  end
end
