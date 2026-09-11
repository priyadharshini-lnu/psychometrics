# frozen_string_literal: true

module ControllerUtilities
  extend ActiveSupport::Concern

  private

  def end_user_side?
    !AdminSubdomain.admin?(request.subdomain)
  end
end
