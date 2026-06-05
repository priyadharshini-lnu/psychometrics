# frozen_string_literal: true

class IdpTemplateDevelopmentAction < ApplicationRecord
  belongs_to :idp_template
  belongs_to :development_action

  include Tenantable

  tenant_source :idp_template

  enum :category, { suggested: 0, available: 1 }
end
