# == Schema Information
#
# Table name: assessment_clients
#
#  id            :integer          not null, primary key
#  assessment_id :integer
#  client_id     :integer
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#

class AssessmentClient < ApplicationRecord
  belongs_to :assessment, inverse_of: :assessment_clients
  belongs_to :client, inverse_of: :assessment_clients

  validates :assessment, :client, presence: true
  validates :assessment_id, uniqueness: { scope: :client_id }

  before_destroy :ensure_delete_assigns_and_reports
  def ensure_delete_assigns_and_reports
    ::Assign.joins(:membership).where(memberships: { client_id: client_id }, assessment_id: assessment_id).delete_all
    ::ClientReport.joins(:report).where(reports: { assessment_id: assessment_id }, client_id: client_id).delete_all
  end
end
