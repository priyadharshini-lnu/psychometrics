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

  scope :for_user, -> (user_id){ joins(:membership).where(memberships: { user_id: user_id }) }

  def self.not_invitation_emails_for(user_id)
    for_user(user_id).joins(:communication).select(:id)
    .where.not(communications: { kind: 'invitation' })
  end

  private

  def delivery_email
    if membership.user.invitation_accepted? && !communication.invitation?
      CommunicationEmailMailer.create(id).deliver_later
    end
  end
end
