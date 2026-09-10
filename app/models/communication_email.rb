# frozen_string_literal: true

class CommunicationEmail < ApplicationRecord
  belongs_to :membership, inverse_of: :communication_emails
  belongs_to :communication, inverse_of: :emails
  belongs_to :campaign_user
  belongs_to :user
  belongs_to :workshop
  belongs_to :workshop_invite
  belongs_to :communication_delivery
  include Tenantable

  tenant_source :communication, :communication_delivery

  has_many :communication_email_resources, inverse_of: :communication_email, dependent: :destroy

  enum :status, { pending: 0, queued: 1, sent: 2, failed: 3, skipped: 4, cancelled: 5 }

  def project_campaign
    communication&.project_campaign || communication_delivery&.campaign
  end

  def content_source
    Communications::Emails::ContentSource.for(self)
  end

  before_create :ensure_user_is_active
  before_create :set_user_id
  before_create :ensure_legacy_not_suppressed

  after_commit :redeliver!, on: :create

  # I'm not certain this scope is used anymore
  scope :for_user, ->(user_id) { joins(:membership).where(memberships: { user_id: user_id }) }
  scope :sent, -> { where(status: :sent) }
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

  def self.ransackable_attributes(_auth_object = nil)
    %w[communication_delivery_id created_at updated_at]
  end

  def redeliver!
    update!(status: :queued)
    CommunicationEmailMailer.create(id).deliver_later(params_for_set_job)
  end

  private

  def ensure_user_is_active
    self.user ||= campaign_user&.user

    return unless campaign_user

    throw(:abort) if user.disabled?

    throw(:abort) unless campaign_user.active?
  end

  def need_to_pass_wait_until?
    communication.present? ? communication.specific_datetime? : communication_delivery&.specific_datetime?
  end

  def params_for_set_job
    wait_until = communication.present? ? communication.delivery_at : communication_delivery&.delivery_at
    params = need_to_pass_wait_until? ? { wait_until: wait_until } : {}
    params.merge!({ queue: 'mailers_low_priority' })
  end

  def set_user_id
    self.user_id = campaign_user.user_id if campaign_user_id.present? && user_id.blank?
  end

  def ensure_legacy_not_suppressed
    return if communication_id.blank?

    throw(:abort) if communication.client.feature_enabled?(:use_new_communication_center)
  end
end
