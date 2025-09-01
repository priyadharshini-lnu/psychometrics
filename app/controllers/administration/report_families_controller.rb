# frozen_string_literal: true

module Administration
  class ReportFamiliesController < Administration::BaseController
    skip_before_action :enforce_geo_restriction
    append_before_action :pundit_authorize
    render_entrypoint :index, element: 'reports', entry: 'admin/reports'

    private

    # Set model
    def resource_class
      @_resource_class ||= ReportFamily # rubocop:disable Naming/MemoizedInstanceVariableName
    end
  end
end
