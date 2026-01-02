# frozen_string_literal: true

module ControllerUtilities
  extend ActiveSupport::Concern

  private

  def end_user_side?
    project_subdomain = request.subdomain.gsub(/\.{0,1}#{Settings.subdomain}/, '') if Settings.subdomain
    project_subdomain.present?
  end
end
