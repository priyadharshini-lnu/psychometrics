# frozen_string_literal: true

module Reports
  class Module < ApplicationRecord
    self.table_name_prefix = 'reports_'

    audited

    include Copyable

    belongs_to :page, class_name: 'Reports::Page', touch: true
    belongs_to :assessment

    tenant_config has_global_records: true, optional: true
    include Tenantable

    tenant_source :page

    has_many :translations, as: :translateable, dependent: :destroy
    has_one :text_module_override, dependent: :destroy

    acts_as_list scope: :page_id

    scope :not_removed, -> { where(deleted_at: nil) }
    scope :pending_removal, -> { where.not(deleted_at: nil) }

    validates :page, presence: true

    # Disables single column inheritance
    self.inheritance_column = :_type_disabled

    def mark_removed!
      update!(deleted_at: Time.zone.now)
    end

    def removed?
      deleted_at.present?
    end
  end
end
