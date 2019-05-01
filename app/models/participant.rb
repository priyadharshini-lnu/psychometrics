class Participant < ApplicationRecord
  belongs_to :subject, class_name: 'User'
  belongs_to :evaluator, class_name: 'User'
  belongs_to :project, class_name: 'Client'
  belongs_to :campaign
  belongs_to :relationship

  def threesixty_evaluator
    Threesixty::Evaluator.find_by(campaign_id: campaign_id, user_id: evaluator_id)
  end
  def threesixty_subject
    Threesixty::Subject.find_by(campaign_id: campaign_id, user_id: subject_id)
  end
end
