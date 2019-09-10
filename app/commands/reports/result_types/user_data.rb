# frozen_string_literal: true

module Reports
  module ResultTypes
    class UserData < BaseType
      def call
        {
          key: data['key'],
          name: data['label'],
          config_data: data,
          value: context.assigns.first.membership.user.try(data['key'])
        }
      end
    end
  end
end
