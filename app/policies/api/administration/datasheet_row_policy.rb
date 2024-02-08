# frozen_string_literal: true

module Api
  module Administration
    class DatasheetRowPolicy < ::Api::Administration::BasePolicy
      def datasheet_for_assessor?
        true
      end
    end
  end
end
