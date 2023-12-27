# frozen_string_literal: true

module ActiveStorageSync
  extend ActiveSupport::Concern

  class_methods do
    def sync_to_active_storage(*attrs)
      @sync_to_active_storage ||= attrs
    end
  end

  included do
    attr_accessor :skip_active_storage_sync

    after_commit lambda {
      previous_changes.slice(*syncable_attributes).reject { |_k, v| v.first == v.last }.keys.compact.map do |attribute|
        ActiveStorageSyncJob.perform_later(id, sti_model_name, attribute) if self[attribute].present?
      end
    }, unless: :skip_active_storage_sync

    private

    def sti_model_name
      model_name.name.constantize
    end

    def syncable_attributes
      sti_model_name&.sync_to_active_storage
    end
  end
end
