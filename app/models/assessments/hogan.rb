module Assessments
  class Hogan < Assessment
    validates :name, presence: true, length: { maximum: 150, allow_blank: true }

    before_create :init_default_state

    # Need for create right urls
    def self.model_name
      Assessment.model_name
    end

    private

    def init_default_state
      self.status = self.class.statuses[:in_progress] unless status
      self.category = CATEGORIES[:hogan]
    end
  end
end
