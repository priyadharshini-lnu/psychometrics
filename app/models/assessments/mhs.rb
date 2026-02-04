# frozen_string_literal: true

module Assessments
  class Mhs < ::Assessment
    before_create :init_default_state

    def self.model_name
      ::Assessment.model_name
    end

    private

    def init_default_state
      self.status = self.class.statuses[:in_progress] unless status
      self.category = CATEGORIES[:mhs]
    end
  end
end
