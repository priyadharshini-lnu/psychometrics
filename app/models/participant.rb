class Participant < ApplicationRecord
  belongs_to :subject, class_name: 'User'
  belongs_to :evaluator, class_name: 'User'
  belongs_to :project, class_name: 'Client'
  belongs_to :campaign
  belongs_to :relationship

  enum manager_status: %i[waiting approved denied], _prefix: :manager
  enum evaluator_status: %i[waiting approved denied], _prefix: :evaluator

  scope :active, -> { where.not(manager_status: :denied, evaluator_status: :denied) }

end
