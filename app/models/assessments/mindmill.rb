# frozen_string_literal: true

module Assessments
  class Mindmill < Assessment
    validates :name, presence: true, length: { maximum: 150, allow_blank: true }
    validates :mindmill_id, presence: true, inclusion: { in: Settings.providers.mindmill.assessments.map(&:id), allow_nil: true }

    before_create :init_default_state

    # Need for create right urls
    def self.model_name
      Assessment.model_name
    end

    private

    def init_default_state
      self.status = self.class.statuses[:in_progress] unless status
      self.category = CATEGORIES[:mindmill]
    end
  end
end
