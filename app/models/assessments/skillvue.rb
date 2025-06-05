# frozen_string_literal: true

module Assessments
  class Skillvue < ::Assessment
    before_create :init_default_state

    private

    def init_default_state
      self.status = self.class.statuses[:in_progress] unless status
      self.category = CATEGORIES[:skillvue]
    end
  end
end
