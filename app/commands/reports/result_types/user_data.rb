module Reports
  module ResultTypes
    class UserData < BaseType
      def call
        {
          key: data['key'],
          name: data['label'],
          value: context.assigns.sample.membership.user.try(data['key'])
        }
      end
    end
  end
end
