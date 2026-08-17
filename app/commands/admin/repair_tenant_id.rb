# frozen_string_literal: true

module Admin
  class RepairTenantId < BaseCommand
    def initialize(model_type:, record_id:, new_tenant_id:)
      @model_type = model_type.to_s
      @record_id = record_id.to_i
      @new_tenant_id = new_tenant_id
    end

    def call
      klass = permitted_class!
      record = klass.unscoped.find(@record_id)
      old_tenant_id = record.tenant_id
      new_tenant_id = resolve_new_tenant_id! # nil if blank

      ActsAsTenant.with_mutable_tenant { record.update!(tenant_id: new_tenant_id) }

      broadcast :ok, {
        record: record,
        model_type: klass.name,
        record_id: record.id,
        old_tenant_id: old_tenant_id,
        new_tenant_id: new_tenant_id
      }
    rescue ActiveRecord::RecordNotFound, ActiveRecord::RecordInvalid, ArgumentError => e
      broadcast :error, e.message
    end

    private

    def permitted_class!
      klass = @model_type.safe_constantize
      valid = klass.is_a?(Class) &&
              klass < ApplicationRecord &&
              klass.respond_to?(:scoped_by_tenant?) &&
              klass.scoped_by_tenant?
      raise ArgumentError, I18n.t('admin.tenant_repair_invalid_model') unless valid

      klass
    end

    def resolve_new_tenant_id!
      return nil if @new_tenant_id.blank?

      Client.tenancies.find(@new_tenant_id.to_i).id
    end
  end
end
