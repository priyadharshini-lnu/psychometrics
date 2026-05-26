# frozen_string_literal: true

class ProfileField < ApplicationRecord
  audited

  belongs_to :question
  belongs_to :profile_setting

  include Tenantable

  tenant_source :profile_setting

  default_scope -> { order(:position) }

  has_many :profile_field_values, dependent: :destroy
end
