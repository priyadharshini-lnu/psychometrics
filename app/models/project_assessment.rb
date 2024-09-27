# frozen_string_literal: true

class ProjectAssessment < ApplicationRecord
  belongs_to :assessment
  belongs_to :project, class_name: 'Client'
end
