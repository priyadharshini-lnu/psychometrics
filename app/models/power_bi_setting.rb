# frozen_string_literal: true

class PowerBiSetting < ApplicationRecord
  belongs_to :project, class_name: 'Client'
end
