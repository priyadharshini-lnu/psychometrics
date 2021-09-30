# frozen_string_literal: true

module Administration
  module Memberships
    class WithPermissionsSerializer < BaseSerializer
      attribute :permissions

      def permissions
        permissions = GetPermissionsHash.call!(
          Administration::Campaigns::AdminPolicy,
          current_user,
          object,
          [
            %w[login_as spoof],
            'edit',
            %w[remove destroy],
            'reset_password',
            'send_mail'
          ],
          instance_options[:project_id]
        )
        permissions.transform_keys! { |k| k.camelcase(:lower) }
      end
    end
  end
end
