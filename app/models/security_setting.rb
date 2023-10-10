# frozen_string_literal: true

class SecuritySetting < ApplicationRecord
  audited

  belongs_to :project, class_name: 'Client'
end
