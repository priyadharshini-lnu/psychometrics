# frozen_string_literal: true

class Administration::DashboardsController < Administration::BaseController
  before_action :skip_policy_scope

  def index
    authorize Dashboard, :index?, policy_class: Api::Administration::DashboardPolicy

    redirect_to admin_path unless helpers.show_dashboard?
  end
end
