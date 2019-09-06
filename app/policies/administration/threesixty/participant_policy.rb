# frozen_string_literal: true

module Administration
  module Threesixty
    class ParticipantPolicy < Threesixty::BasePolicy
      def spoof?
        index?
      end

      def destroy?
        index?
      end
    end
  end
end
