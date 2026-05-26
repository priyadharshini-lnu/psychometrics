# frozen_string_literal: true

class RegistrationSetting < ApplicationRecord
  audited
  include ApplicationConfigurationLoggable

  belongs_to :project, class_name: 'Client'
  include Tenantable
end
