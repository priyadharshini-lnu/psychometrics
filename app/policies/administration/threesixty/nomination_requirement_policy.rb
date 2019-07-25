# frozen_string_literal: true

module Administration
  module Threesixty
    class NominationRequirementPolicy < BasePolicy
      def save?
        index?
      end
    end
  end
end
