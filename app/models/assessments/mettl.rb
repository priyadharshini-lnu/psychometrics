# frozen_string_literal: true

module Assessments
  class Mettl < ::Assessment
    validates :owner_id, :project_id, presence: true

    before_create :init_default_state

    private

    def init_default_state
      self.status = self.class.statuses[:in_progress] unless status
      self.category = CATEGORIES[:mettl]
    end
  end
end
