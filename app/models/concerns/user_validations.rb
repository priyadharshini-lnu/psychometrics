module UserValidations
  extend ActiveSupport::Concern
  included do
    validates :email, :role, presence: true
    validates :first_name, :last_name, :email, length: { maximum: 100 }
    validates :email, format: { with: /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\Z/i }
    validates :role, inclusion: { in: ::User::USER_ROLES.values }, allow_nil: true
  end
end
