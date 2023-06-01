# frozen_string_literal: true

module Administration
  module Clients
    class LicensesController < Administration::BaseController
      include Administration::Clients
      prepend_before_action :set_resource_class
      before_action :ensure_client, except: :overview
      before_action :set_resource, only: %i[edit update toggle_status]
      append_before_action :pundit_authorize
      before_action :init_state, only: [:index]

      def index
        @init_state[:licenses] = []
      end

      def create
        form = Licenses::CreateForm.new(resource_params.merge(client_id: client.root.id))
        @_resource = client.root.licenses.build(resource_params)
        if form.valid?
          resource.save
          audit! :create, resource, payload: resource_params, client: client
        else
          resource.validate
          render :new
        end
      end

      def update
        audit! :update, resource, payload: resource_params, client: client
        render :edit unless resource.update(resource_params)
      end

      def overview
        @_resource = policy_scope(Client).
                     includes(licenses: %i[report_family license_usages]).
                     find(client.root.id)
      end

      def toggle_status
        resource.toggle!(:disabled)
        audit! :toggle_status, resource, client: client, payload: { disabled: resource.disabled }
        respond_to do |format|
          format.js
        end
      end

      def i18n
        'clients.licenses'
      end

      private

      def set_resource_class
        @_resource_class ||= License # rubocop:disable Naming/MemoizedInstanceVariableName
      end

      def set_resource
        @_resource = policy_scope(resource_class).includes(:report_family, :license_usages).find(params[:id])
      end

      def resource_params
        params.require(:resource).permit(:number, :overuse_number, :report_family_id,
                                         :start_date, :end_date, :disabled, :type)
      end

      def pundit_authorize
        authorize(
          :license,
          nil,
          project_id: client.id
        )
      end
    end
  end
end
