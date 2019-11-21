# frozen_string_literal: true

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

  scope :report_filterable_fields, lambda { |query|
    if (query !~ /\D/) && query.present?
      joins(:report).where('reports.id = ? OR reports.name ILIKE ?', query, "%#{query}%")
    else
      joins(:report).where('reports.name ILIKE ?', "%#{query}%")
    end
  }

  class << self
    def ransackable_scopes(_auth_object = nil)
      %i[report_filterable_fields]
    end
  end
end
