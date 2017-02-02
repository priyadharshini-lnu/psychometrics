# == Schema Information
#
# Table name: assign_clients_reports
#
#  id               :integer          not null, primary key
#  report_id        :integer
#  assign_client_id :integer
#  created_at       :datetime         not null
#  updated_at       :datetime         not null
#

class AssignClientsReport < ApplicationRecord
  belongs_to :assign_client
  belongs_to :report

  validates :assign_client_id, uniqueness: { scope: :report_id }

  # TODO: works only with destroy|destroy_all, dont use delete|delete_all
  before_destroy :ensure_delete_assigns_reports
  def ensure_delete_assigns_reports
    AssignsReport.joins(assign: :membership).where(memberships: { client_id: assign_client.client_id }, report_id: report_id).delete_all
  end
end
