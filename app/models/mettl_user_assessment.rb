# frozen_string_literal: true

class MettlUserAssessment < ApplicationRecord
  audited

  belongs_to :user_assessment
  belongs_to :mettl_schedule_record, optional: true

  delegate :user_reports, to: :user_assessment
end
