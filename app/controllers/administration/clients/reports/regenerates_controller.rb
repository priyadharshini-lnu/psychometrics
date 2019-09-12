# frozen_string_literal: true

module Administration
  module Clients
    module Reports
      class RegeneratesController < Administration::BaseController
        include Administration::Clients
        prepend_before_action :set_resource_class
        before_action :ensure_not_root
        append_before_action :pundit_authorize

        def create
          @_resource = resource_class.from_params(params)
          ::Administration::RegenerateReports.call(resource, current_user, client) do
            on(:invalid) { render :new }
          end
        end

        protected

        def i18n
          'clients.reports'
        end

        def set_resource_class
          @_resource_class = Administration::RegenerateReportsForm
        end

        # Authorisation user
        #
        def pundit_authorize
          authorize :report, :regenerate?
        end
      end
    end
  end
end
