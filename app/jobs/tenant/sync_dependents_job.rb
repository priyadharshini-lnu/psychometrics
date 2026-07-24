# frozen_string_literal: true

module Tenant
  class SyncDependentsJob < ApplicationJob
    queue_as :async_request_handler

    def perform(source_class_name, record_ids)
      Rails.application.eager_load!

      source_class = source_class_name.constantize
      cascade(source_class, record_ids)
    end

    private

    def cascade(source_class, record_ids, visited = Set.new)
      pending_ids = Array(record_ids).compact.uniq.reject do |record_id|
        visited.include?([source_class.base_class.name, record_id])
      end
      return if pending_ids.empty?

      pending_ids.each { |record_id| visited << [source_class.base_class.name, record_id] }

      source_dependents = Tenantable::DEPENDENT_REGISTRY[source_class.base_class]
      return if source_dependents.blank?

      source_dependents.each do |entry|
        dependent_class = entry[:klass]
        fk = entry[:fk]
        relation = dependent_class.unscoped.where(fk => pending_ids)
        next unless relation.exists?

        dependent_ids = []
        relation.find_each do |record|
          record.send(:sync_resolved_tenant_id!)
          dependent_ids << record.id
        end

        cascade(dependent_class, dependent_ids, visited)
      end
    end
  end
end
