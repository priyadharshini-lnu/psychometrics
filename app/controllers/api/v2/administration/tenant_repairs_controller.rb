# frozen_string_literal: true

module Api
  class V2::Administration::TenantRepairsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction

    SAFE_COLUMNS = (%w[id tenant_id] + Tenantable::TENANT_DERIVING_COLUMNS).freeze

    def search_models
      query = params[:q].to_s.strip.downcase

      all_types = Tenantable::DEPENDENT_REGISTRY.keys.map(&:name).sort

      results = query.present? ? all_types.select { |t| t.downcase.include?(query) } : all_types
      render json: results.first(20)
    end

    def preview
      klass = permitted_class!(params[:model_type])
      return if performed?

      record = ActsAsTenant.without_tenant { klass.unscoped.find(params[:record_id].to_i) }
      tenant = ActsAsTenant.without_tenant { Client.find_by(id: record.tenant_id) }
      visible_columns = SAFE_COLUMNS.select { |col| record.has_attribute?(col) }

      resolved_supported = record.respond_to?(:resolved_tenant_id, true)
      resolved_id, resolved_tenant = ActsAsTenant.without_tenant do
        rid = resolve_tenant_id_for(record)
        [rid, Client.find_by(id: rid)]
      end

      render json: record.attributes.slice(*visible_columns).merge(
        'tenant_name'               => tenant&.name,
        'resolved_tenant_id'        => resolved_id,
        'resolved_tenant_name'      => resolved_tenant&.name,
        'resolved_tenant_supported' => resolved_supported
      )
    end

    def update_tenant
      Admin::RepairTenantId.call(**update_tenant_params) do
        on(:ok) do |result|
          audit! :update_tenant, result[:record], payload: params
          render json: result.except(:record)
        end
        on(:error) { |message| render json: { error: message }, status: :unprocessable_entity }
      end
    end

    private

    def update_tenant_params
      params.permit(:model_type, :record_id).
        to_h.
        symbolize_keys.
        merge(new_tenant_id: params[:new_tenant_id])
    end

    def permitted_class!(model_type)
      name = model_type.to_s
      klass = name.match?(/\A[A-Z][A-Za-z0-9:]*\z/) ? name.safe_constantize : nil
      unless acts_as_tenant_model?(klass)
        render json: { error: I18n.t('admin.tenant_repair_invalid_model') }, status: :unprocessable_entity
      end
      klass
    end

    def resolve_tenant_id_for(record)
      return nil unless record.respond_to?(:resolved_tenant_id, true)

      record.send(:resolved_tenant_id)
    end

    def acts_as_tenant_model?(klass)
      klass.is_a?(Class) &&
        klass < ApplicationRecord &&
        klass.respond_to?(:scoped_by_tenant?) &&
        klass.scoped_by_tenant?
    end

    def pundit_authorize
      authorize(nil, nil, policy_class: Api::Administration::TenantRepairPolicy)
    end
  end
end
