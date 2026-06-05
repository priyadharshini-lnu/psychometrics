# frozen_string_literal: true

class CommunicationEmail < ApplicationRecord
  belongs_to :membership, inverse_of: :communication_emails
  belongs_to :communication, inverse_of: :emails
  belongs_to :campaign_user
  belongs_to :user
  belongs_to :workshop
  belongs_to :workshop_invite
  include Tenantable

  tenant_source :communication

  has_many :communication_email_resources, inverse_of: :communication_email, dependent: :destroy

  delegate :project_campaign, to: :communication, allow_nil: true

  before_create :ensure_user_is_active
  before_create :set_user_id

  after_commit :delivery_email, on: :create

  # I'm not certain this scope is used anymore
  scope :for_user, ->(user_id) { joins(:membership).where(memberships: { user_id: user_id }) }
  scope :sent, -> { where.not(sent_at: nil) }
  scope :invitation_within_last_24_hrs, lambda { |project_id|
                                          joins(:communication).
                                            where(communication: {
                                              kind: Communication.kinds[:invitation],
                                              project_id: project_id
                                            }).
                                            where('sent_at > ? ', 24.hours.ago)
                                        }

  def self.create_with_resources(attributes, resources)
    ApplicationRecord.transaction do
      communication_email = CommunicationEmail.create(attributes)
      Array.wrap(resources).each do |resource|
        communication_email.communication_email_resources.create!(resource: resource)
      end
    end
  end

  private

  def ensure_user_is_active
    user ||= campaign_user&.user

    return unless user

    throw(:abort) if user.disabled?

    throw(:abort) unless campaign_user&.active?
  end

  def need_to_pass_wait_until?
    communication.specific_datetime?
  end

  def params_for_set_job
    params = need_to_pass_wait_until? ? { wait_until: communication.delivery_at } : {}
    params.merge!({ queue: 'mailers_low_priority' })
  end

  def set_user_id
    self.user_id = campaign_user.user_id if campaign_user_id.present? && user_id.blank?
  end

  def delivery_email
    CommunicationEmailMailer.create(id).deliver_later(params_for_set_job)
  end
end
