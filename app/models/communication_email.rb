class CommunicationEmail < ApplicationRecord
  belongs_to :membership, inverse_of: :communication_emails, foreign_key: :membership_id
  belongs_to :communication, inverse_of: :emails

  after_create :delivery_email
  def delivery_email
    CommunicationEmailMailer.create(id).deliver_later
  end
end
