# frozen_string_literal: true

module Reports
  class Page < ApplicationRecord
    self.table_name_prefix = 'reports_'

    audited

    include Copyable

    belongs_to :report, touch: true

    tenant_config has_global_records: true, optional: true
    include Tenantable

    tenant_source :report

    has_many :all_modules, class_name: 'Reports::Module',
                           dependent: :destroy, inverse_of: :page
    has_many :modules, -> { not_removed },
             class_name: 'Reports::Module', foreign_key: :page_id, inverse_of: :page

    default_scope { order(:position) }

    scope :not_removed, -> { where(deleted_at: nil) }
    scope :pending_removal, -> { where.not(deleted_at: nil) }

    acts_as_list scope: :report_id

    validates :report, presence: true

    def mark_removed!
      transaction do
        all_modules.each(&:mark_removed!)
        update!(deleted_at: Time.zone.now)
      end
    end

    def removed?
      deleted_at.present?
    end
  end
end
