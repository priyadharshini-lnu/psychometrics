# frozen_string_literal: true

class TextModuleOverride < ApplicationRecord
  audited

  belongs_to :user_report
  belongs_to :module, class_name: 'Reports::Module'
  belongs_to :editor, class_name: 'User'
  include Tenantable

  tenant_source :user_report
end
