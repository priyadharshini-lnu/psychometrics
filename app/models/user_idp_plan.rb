# frozen_string_literal: true

class UserIdpPlan < ApplicationRecord
  belongs_to :user
  belongs_to :campaign
  belongs_to :idp_template
  belongs_to :creator, class_name: 'User'
  has_many :user_idp_skills, dependent: :destroy
  has_many :skills, through: :user_idp_skills
  has_many :user_idp_development_actions, dependent: :destroy
  has_many :development_actions, through: :user_idp_development_actions
  has_many :idp_template_skills, through: :idp_template
  has_many :communication_email_resources, as: :resource
  has_many :communication_emails, through: :communication_email_resources

  enum status: { draft: 0, pending_approval: 1, approved: 2 }

  scope :active, -> { where(active: true) }

  after_create :schedule_idp_assigned_notification

  private

  def campaign_user
    CampaignUser.find_by(campaign_id: campaign_id, user_id: user_id)
  end

  def schedule_idp_assigned_notification
    return if communication_emails.joins(:communication).
              exists?(communications: { kind: :idp_template_assigned })

    communication = Communication.order(:created_at).where(kind: :idp_template_assigned, campaign_id: campaign_id).last
    return unless communication

    communication.create_communication_email_with_resources(
      { user: user, campaign_user: campaign_user },
      self
    )
  end
end
