# frozen_string_literal: true

module Assessments
  class Microsite < ::Assessment
    before_create :init_default_state

    private

    def init_default_state
      self.flow ||= { elements: [] }
      self.status = self.class.statuses[:in_progress] unless status
      self.category = CATEGORIES[:microsite]
    end
  end
end
