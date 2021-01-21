# frozen_string_literal: true

module Administration
  class AdminJobRecordPolicy < Administration::BasePolicy
    class Scope < Scope
      def resolve
        super.where(owner: @user)
      end
    end
  end
end
