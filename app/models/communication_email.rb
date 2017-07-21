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
  def delivery_email
    CommunicationEmailMailer.create(id).deliver_later
  end
end
