# frozen_string_literal: true

class Administration::AppController < ::Administration::BaseController
  render_entrypoint :dashboard, element: 'admin-app-container', entry: 'admin/admin'

  def dashboard; end
end
