class Participant < ApplicationRecord
  belongs_to :subject, class_name: 'User'
  belongs_to :evaluator, class_name: 'User'
  belongs_to :project, class_name: 'Client'
  belongs_to :campaign
  belongs_to :relationship
end
