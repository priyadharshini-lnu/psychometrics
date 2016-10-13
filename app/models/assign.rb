class Assign < ApplicationRecord
  belongs_to :user
  belongs_to :assessment
  belongs_to :client
  has_and_belongs_to_many :reports, join_table: :assigns_reports

  validates_uniqueness_of :client_id, scope: [:assessment_id, :user_id]

  enum status: [:not_started, :in_progress, :completed]
  enum role: [:member, :manager, :admin]
end
