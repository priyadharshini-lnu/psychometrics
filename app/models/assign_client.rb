# == Schema Information
#
# Table name: assign_clients
#
#  id              :integer          not null, primary key
#  client_id       :integer
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  assessment_id   :integer
#

class AssignClient < ApplicationRecord
  belongs_to :client, inverse_of: :assign_clients
  belongs_to :assessment
  has_many :assign_clients_reports, dependent: :destroy
  has_many :reports, through: :assign_clients_reports, dependent: :destroy

  validates_uniqueness_of :assessment_id, scope: [:client_id], message: :not_uniqueness

  before_destroy :ensure_delete_assigns

  def ensure_delete_assigns
    Assign.joins(:membership).where(memberships: { client_id: client_id }, assessment_id: assessment_id).delete_all
  end
end
