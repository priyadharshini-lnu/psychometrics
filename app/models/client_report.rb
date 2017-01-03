# == Schema Information
#
# Table name: client_reports
#
#  id                :integer          not null, primary key
#  client_id         :integer
#  report_id         :integer
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  access_reports_at :datetime
#

class ClientReport < ApplicationRecord
  belongs_to :client, inverse_of: :client_reports
  belongs_to :report, inverse_of: :client_reports

  validates :client, :report, presence: true
  validates :client_id, uniqueness: { scope: :report_id }
end
