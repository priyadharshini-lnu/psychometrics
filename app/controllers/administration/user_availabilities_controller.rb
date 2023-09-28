# frozen_string_literal: true

module Administration
  class UserAvailabilitiesController < Administration::BaseController
    render_entrypoint :index, element: 'user-availability', entry: 'admin/user_availability'
  end
end
