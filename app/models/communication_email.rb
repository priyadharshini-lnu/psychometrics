# frozen_string_literal: true

class CommunicationEmail < ApplicationRecord
  belongs_to :membership, inverse_of: :communication_emails
  belongs_to :communication, inverse_of: :emails
  belongs_to :campaign_user
  has_one :user, through: :campaign_user
  belongs_to :workshop
  belongs_to :workshop_invite

  after_commit :delivery_email, on: :create

  # I'm not certain this scope is used anymore
  scope :for_user, ->(user_id) { joins(:membership).where(memberships: { user_id: user_id }) }
  scope :sent, -> { where.not(sent_at: nil) }

  private

  def need_to_pass_wait_until?
    communication.specific_datetime?
  end

  def params_for_set_job
    params = need_to_pass_wait_until? ? { wait_until: communication.delivery_at } : {}
    params.merge!({ queue: 'mailers_low_priority' })
  end

  def delivery_email
    CommunicationEmailMailer.create(id).deliver_later(params_for_set_job)
  end
end
