module MembershipValidations
  extend ActiveSupport::Concern
  included do
    validates :client, :user, presence: true
  end
end
