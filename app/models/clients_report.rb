# frozen_string_literal: true

# This model is not in use. Remove it
class ClientsReport < ApplicationRecord
  audited

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
