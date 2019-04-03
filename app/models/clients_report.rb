# == Schema Information
#
# Table name: clients_reports
#
#  id         :integer          not null, primary key
#  client_id  :integer
#  report_id  :integer
#  created_at :datetime         not null
#  updated_at :datetime         not null
#

class ClientsReport < ApplicationRecord
  belongs_to :client, inverse_of: :clients_reports
  belongs_to :report, inverse_of: :clients_reports
  belongs_to :report_family
end
