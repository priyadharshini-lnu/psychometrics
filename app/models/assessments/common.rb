# frozen_string_literal: true

module Assessments
  class Common < Assessment
    validates :name, :dimension, presence: true
    validates :name, length: { maximum: 150 }, allow_blank: true
    validates :owner, presence: true, allow_nil: true
    validate :check_owner

    before_create :init_default_state

    # Need for create right urls
    def self.model_name
      Assessment.model_name
    end

    private

    def init_default_state
      self.flow ||= { elements: [] }
      self.status = self.class.statuses[:in_progress] unless status
      self.category = self.class.categories[:psychometric] unless category
      self.norm_rules ||= {}
    end

    def check_owner
      errors.add(:owner, :invalid) if owner&.ancestors?
    end
  end
end
