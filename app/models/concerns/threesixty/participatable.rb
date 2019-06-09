module Threesixty
  module Participatable
    extend ActiveSupport::Concern

    included do
      belongs_to :user
      belongs_to :campaign, class_name: '::Campaign'
      has_one :project, through: :campaign
      has_many :active_participants, -> { active }, foreign_key: :evaluator_id, primary_key: :user_id,  class_name: '::Participant'
      has_many :users_assessments, through: :user
      has_many :users_reports, through: :user
      has_many :evaluated_results, through: :user
      has_many :evaluation_results, through: :user
    end
  end
end
