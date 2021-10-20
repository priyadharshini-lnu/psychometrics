# frozen_string_literal: true

module Campaigns
  module Admins
    class Update < Rectify::Command
      attr_accessor :resource, :form, :current_user, :resource_params

      def initialize(resource, form, current_user, resource_params)
        @resource = resource
        @form = form
        @current_user = current_user
        @resource_params = resource_params
      end

      def call
        return broadcast(:invalid), form if form.invalid?

        resource.user.modified_by_id = current_user.id
        if resource.update(resource_params)
          broadcast :ok, resource
        else
          broadcast :error, resource.errors.full_messages.first
        end
      end
    end
  end
end
