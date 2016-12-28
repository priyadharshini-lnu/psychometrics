class UserForm < BaseForm
  include UserValidations
  include MembershipValidations

  attr_accessor :email, :first_name, :last_name,
                :parent_id, :role, :client, :user,
                :operator

  validate :uniqueness_membership, if: proc { user.id }

  def uniqueness_membership
    errors.add(:email, :taken) if Membership.exists?(client_id: client.id, user_id: user.id)
  end

  def initialize(data = {})
    super
    @user = User.find_or_initialize_by(email: email)
  end

  # Forms are never themselves persisted
  def persisted?
    false
  end

  def save
    if valid?
      persist!
      true
    else
      false
    end
  end

  private

  def persist!
    save_user! if @user.new_record?
    @user.memberships.create!(client_id: client.id, parent_id: parent_id)
    self
  end

  def save_user!
    @user.assign_attributes({ first_name: first_name, last_name: last_name,
                              role: role, operator: operator })
    @user.save!
  end
end
