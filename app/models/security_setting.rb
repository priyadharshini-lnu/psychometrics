# frozen_string_literal: true

class SecuritySetting < ApplicationRecord
  belongs_to :project, class_name: 'Client'
end
