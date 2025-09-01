# frozen_string_literal: true

module Administration
  class UserAvailabilitiesController < Administration::BaseController
    skip_before_action :enforce_geo_restriction
    render_entrypoint :index, element: 'user-availability', entry: 'admin/user_availability'
  end
end
