# frozen_string_literal: true

class Notification < ApplicationRecord
  belongs_to :membership
  belongs_to :assessment

  tenant_config has_global_records: true, optional: true
  include Tenantable

  tenant_source :assessment, :membership

  validates :text, presence: true
end
