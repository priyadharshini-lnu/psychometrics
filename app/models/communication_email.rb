# frozen_string_literal: true

# == Schema Information
#
# Table name: communication_emails
#
#  id               :integer          not null, primary key
#  membership_id    :integer
#  communication_id :integer
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#

class CommunicationEmail < ApplicationRecord
  belongs_to :membership, inverse_of: :communication_emails, foreign_key: :membership_id
  belongs_to :communication, inverse_of: :emails

  after_commit :delivery_email, on: :create

  scope :for_user, ->(user_id) { joins(:membership).where(memberships: { user_id: user_id }) }
  scope :sent, -> { where.not(sent_at: nil) }

  private

  def need_to_pass_wait_until?
    communication.specific_datetime?
  end

  def params_for_set_job
    need_to_pass_wait_until? ? { wait_until: communication.delivery_at } : {}
  end

  def delivery_email
    CommunicationEmailMailer.create(id).deliver_later(params_for_set_job)
  end
end
