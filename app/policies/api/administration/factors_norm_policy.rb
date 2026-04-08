# frozen_string_literal: true

module Api
  module Administration
    class FactorsNormPolicy < ::Administration::FactorsNormPolicy
      def update_cell?
        @user.is?(:superadmin)
      end
    end
  end
end
