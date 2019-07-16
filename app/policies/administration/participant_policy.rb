# frozen_string_literal: true

module Administration
  class ParticipantPolicy < Threesixty::BasePolicy
    def spoof?
      index?
    end

    def destroy?
      index?
    end
  end
end
