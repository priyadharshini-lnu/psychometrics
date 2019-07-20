# frozen_string_literal: true

module Administration
  module Threesixty
    class EmailTemplatePolicy < BasePolicy
      def send_test_email?
        index?
      end
    end
  end
end
