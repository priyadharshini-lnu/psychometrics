class ClientsReport < ApplicationRecord
  belongs_to :client, inverse_of: :clients_reports
  belongs_to :report, inverse_of: :clients_reports
end
