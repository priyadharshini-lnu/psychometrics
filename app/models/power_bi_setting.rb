# frozen_string_literal: true

class PowerBiSetting < ApplicationRecord
  audited

  belongs_to :project, class_name: 'Client'
end
