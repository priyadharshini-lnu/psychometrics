# frozen_string_literal: true

# TODO: do we need it?
class UserForm < BaseForm
  include UserValidations
  include MembershipValidations
  include ActiveModel::Validations::Callbacks

  attr_accessor :email, :first_name, :last_name,
                :parent_id, :membership_role, :client, :user,
                :operator

  validate :uniqueness_membership, if: proc { user.id }
  validates :membership_role, inclusion: { in: ::Membership::MEMBERSHIP_ROLES }, presence: true
  before_validation :use_license

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
    (persist! && return) if valid?
    false
  end

  def use_license
    Licenses::UsersLicense.use(self)
  end

  private

  def persist!
    save_user! if @user.new_record?
    membership_attributes = { parent_id: parent_id, role: membership_role }
    @user.memberships.create!(membership_attributes.merge(client_id: client.id))
    @user.memberships.create_with(membership_attributes).find_or_create_by(client_id: client.parent_id) if client.subtenancy?
    self
  end

  def save_user!
    @user.assign_attributes(first_name: first_name, last_name: last_name, operator: operator)
    @user.save!
  end
end
