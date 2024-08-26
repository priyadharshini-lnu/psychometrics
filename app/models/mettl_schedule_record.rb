# frozen_string_literal: true

class MettlScheduleRecord < ApplicationRecord
  belongs_to :project, class_name: 'Client'
  belongs_to :assessment
end
