# frozen_string_literal: true

class MettlScheduleRecord < ApplicationRecord
  belongs_to :project, class_name: 'Client'
  belongs_to :assessment
  belongs_to :parent_schedule, class_name: 'MettlScheduleRecord', foreign_key: 'duplicated_from_id', optional: true
  include Tenantable

  def parent_or_self
    parent_schedule || self
  end

  scope :parent_schedules, -> { where(duplicated_from_id: nil) }

  scope :filterable_fields, lambda { |query|
                              where(
                                'mettl_schedule_records.schedule_name ILIKE :query ' \
                                'OR mettl_schedule_records.schedule_id = :query_id',
                                query: "%#{query}%", query_id: query.to_i
                              )
                            }

  def self.ransackable_scopes(_auth_object = nil)
    %i[filterable_fields]
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name assessment_id]
  end
end
