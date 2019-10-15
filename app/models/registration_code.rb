# frozen_string_literal: true

class RegistrationCode < ApplicationRecord
  belongs_to :end_level, class_name: 'Client'
  belongs_to :project, class_name: 'Client'
  has_many :license_usages, dependent: :nullify
end
