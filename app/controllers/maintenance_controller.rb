# frozen_string_literal: true

class MaintenanceController < ApplicationController
  layout 'maintenance'
  skip_before_action :set_client_by_subdomain
  skip_before_action :redirect_to_maintenance

  def index
    redirect_to root_url unless helpers.maintenance_started?
  end

  def skip_authentication?
    true
  end
end
