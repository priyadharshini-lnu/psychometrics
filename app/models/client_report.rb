class ClientReport < ApplicationRecord
  belongs_to :client, inverse_of: :client_reports
  belongs_to :report, inverse_of: :client_reports

  validates :client, :report, presence: true
  validates :client_id, uniqueness: { scope: :report_id }
end
