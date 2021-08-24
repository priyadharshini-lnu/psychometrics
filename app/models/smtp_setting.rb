# frozen_string_literal: true

class SmtpSetting < ApplicationRecord
  belongs_to :project, class_name: 'Client'
end
