class AssessmentClient < ApplicationRecord
  belongs_to :assessment, inverse_of: :assessment_clients
  belongs_to :client, inverse_of: :assessment_clients

  validates :assessment, :client, presence: true
  validates :assessment_id, uniqueness: { scope: :client_id }

  before_destroy :ensure_delete_assigns
  def ensure_delete_assigns
    Assign.where(client_id: client_id, assessment_id: assessment_id).delete_all
  end
end
