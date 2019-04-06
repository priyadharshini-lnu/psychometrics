class Participant < ApplicationRecord
  belongs_to :subject, class_name: 'CampaignsUser'
  belongs_to :evaluator, class_name: 'CampaignsUser'
  belongs_to :project, class_name: 'Client'
  belongs_to :campaign
  belongs_to :relationship
end
