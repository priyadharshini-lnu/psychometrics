# frozen_string_literal: true

class UserIdpDevelopmentAction < ApplicationRecord
  belongs_to :user_idp_plan
  belongs_to :development_action, optional: true
  belongs_to :user_idp_skill
  has_one :skill, through: :user_idp_skill
  has_one :user, through: :user_idp_plan
  has_many :communication_email_resources, as: :resource
  has_many :communication_emails, through: :communication_email_resources

  enum :custom_action_learning_style, {
    on_the_job: 0,
    learning_from_others: 1,
    structured_learning: 2
  }

  validates :custom_action_learning_style, presence: true, if: :custom_action?

  def learning_style
    return nil if custom_action?

    development_action&.learning_style
  end
end
