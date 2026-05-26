# frozen_string_literal: true

class ProfileFieldValue < ApplicationRecord
  belongs_to :profile_field
  belongs_to :user_profile

  include Tenantable

  tenant_source :profile_field

  def value=(val)
    if val.is_a?(Numeric)
      self.numeric_value = val
    else
      self.string_value = val
    end
  end

  def value
    numeric_value || string_value
  end
end
