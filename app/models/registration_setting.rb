# frozen_string_literal: true

class RegistrationSetting < ApplicationRecord
  audited

  belongs_to :project, class_name: 'Client'
end
