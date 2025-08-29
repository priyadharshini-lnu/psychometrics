# frozen_string_literal: true

module Api
  module Administration
    class QuestionPolicy < ::Administration::BasePolicy
      def index?
        @user.is?(:superadmin)
      end
    end
  end
end
