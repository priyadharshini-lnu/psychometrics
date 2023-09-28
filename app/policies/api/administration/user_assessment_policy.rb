# frozen_string_literal: true

module Api
  module Administration
    class UserAssessmentPolicy < BasePolicy
      def index?
        true
      end
    end
  end
end
