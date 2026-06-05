# frozen_string_literal: true

module Reports
  class Module < ApplicationRecord
    self.table_name_prefix = 'reports_'

    audited

    include Copyable

    belongs_to :page, class_name: 'Reports::Page', touch: true
    belongs_to :assessment

    include Tenantable

    tenant_source :page

    has_many :translations, as: :translateable, dependent: :destroy
    has_one :text_module_override, dependent: :destroy

    acts_as_list scope: :page_id

    validates :page, presence: true

    # Disables single column inheritance
    self.inheritance_column = :_type_disabled
  end
end
