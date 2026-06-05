# frozen_string_literal: true

class UserIdpDevelopmentAction < ApplicationRecord
  include SoftDelete

  has_paper_trail

  belongs_to :user_idp_plan
  belongs_to :development_action
  belongs_to :user_idp_skill, optional: true
  include Tenantable

  tenant_source :user_idp_plan

  has_one :skill, through: :user_idp_skill
  has_one :user, through: :user_idp_plan
  has_many :communication_email_resources, as: :resource
  has_many :communication_emails, through: :communication_email_resources

  scope :with_public_skills, -> { joins(:user_idp_skill).where(user_idp_skills: { private: false }) }

  def learning_style
    development_action&.learning_style
  end
end
