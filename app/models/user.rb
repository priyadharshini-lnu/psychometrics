# == Schema Information
#
# Table name: users
#
#  id                     :integer          not null, primary key
#  email                  :string           default(""), not null
#  encrypted_password     :string           default(""), not null
#  reset_password_token   :string
#  reset_password_sent_at :datetime
#  remember_created_at    :datetime
#  sign_in_count          :integer          default(0), not null
#  current_sign_in_at     :datetime
#  last_sign_in_at        :datetime
#  current_sign_in_ip     :inet
#  last_sign_in_ip        :inet
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#  first_name             :string
#  last_name              :string
#  disabled               :boolean          default(FALSE)
#  role                   :enum             default("user")
#

class User < ApplicationRecord

  # Authentication
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  # Roles
  USER_ROLES = {
    superadmin: 'superadmin',
    admin: 'admin',
    manager: 'manager',
    user: 'user'
  }

  GROUP_USER_ROLES = {
    administrators: USER_ROLES.slice(:superadmin, :admin),
    users:          USER_ROLES.slice(:manager, :user)
  }

  enum role: USER_ROLES

  def full_name
    if first_name.present? || last_name.present?
      "#{first_name} #{last_name}".to_s
    else
      email
    end
  end

  def active?
    !disabled
  end

  filterrific(
    default_filter_params: {
      sorted_by: 'created_at_desc',
      with_role: 'all'
    },
    available_filters: [
      :sorted_by,
      :search_query,
      :with_role
    ]
  )
  scope :sorted_by, lambda { |sort_key|
    # Sorts students by sort_key
  }

  scope :search_query, lambda { |query|
    # Filters students whose name or email matches the query
  }

  scope :with_role, -> (role) do
    if role == 'users'
      where(role: GROUP_USER_ROLES[:users].keys)
    elsif role == 'administrators'
      where(role: GROUP_USER_ROLES[:administrators].keys) if role == 'administrators'
    end
  end

  def self.options_for_with_role
    [
      'all',
      'users',
      'administrators'
    ]
  end
end
