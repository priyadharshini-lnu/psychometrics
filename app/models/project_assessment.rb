# frozen_string_literal: true

class ProjectAssessment < ApplicationRecord
  belongs_to :assessment
  belongs_to :project, class_name: 'Client'
  include Tenantable

  scope :filterable_fields, ->(search_term) { joins(:assessment).merge(Assessment.filterable_fields(search_term)) }

  def self.ransackable_scopes(_auth_object = nil)
    %i[filterable_fields]
  end
end
