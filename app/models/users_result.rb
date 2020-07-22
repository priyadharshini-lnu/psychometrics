# frozen_string_literal: true

class UsersResult < ApplicationRecord
  include EncodableId

  belongs_to :campaign
  belongs_to :subject, class_name: 'User'
  belongs_to :evaluator, class_name: 'User'
  belongs_to :assessment
  has_one :participant, class_name: 'Threesixty::Participant'
  has_many :media_responses
  enum status: { not_started: 0, in_progress: 1, completed: 2 }
  has_one :user_assessment

  scope :actual_by_options, lambda { |options|
    where('subject_id != evaluator_id') unless options.participants.dig('subject', 'can_evaluate_self')
  }

  def threesixty_subject
    Threesixty::Subject.find_by(campaign_id: campaign_id, user_id: subject_id)
  end

  def expired?
    return false unless expiry_date

    expiry_date < Time.current
  end
end
