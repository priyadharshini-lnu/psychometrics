# frozen_string_literal: true

class MettlScheduleRecord < ApplicationRecord
  belongs_to :project, class_name: 'Client'
  belongs_to :assessment
  belongs_to :parent_schedule, class_name: 'MettlScheduleRecord', foreign_key: 'duplicated_from_id', optional: true

  def parent_or_self
    parent_schedule || self
  end
end
