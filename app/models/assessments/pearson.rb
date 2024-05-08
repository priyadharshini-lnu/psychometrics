# frozen_string_literal: true

module Assessments
  class Pearson < ::Assessment
    before_create :init_default_state

    # Need for create right urls
    def self.model_name
      ::Assessment.model_name
    end

    private

    def init_default_state
      self.status = self.class.statuses[:in_progress] unless status
      self.category = CATEGORIES[:pearson]
    end
  end
end
