# frozen_string_literal: true

module ActiveRecordAuditLogs
  class RecordHistorySearch
    DEFAULT_PAGE_SIZE = 25
    MAX_PAGE_SIZE = 200
    CHANGED_FIELD_EXISTS_SQL = 'jsonb_exists(audited_changes, :field)'

    def initialize(params)
      @params = params.to_h.with_indifferent_access
    end

    def call
      ApplicationRecord.read_from_replica do
        ActsAsTenant.without_tenant do
          base = base_relation
          next empty_result if base.nil?

          enforce_geo(base)
          build_result(base)
        end
      end
    end

    private

    attr_reader :params

    def empty_result
      { list: [], total: 0, types: [], fields: [] }
    end

    def base_relation
      return ActiveRecordAudit.where(request_uuid: params[:request_uuid]) if params[:request_uuid].present?
      return unless params[:record_type].present? && params[:record_id].present?

      apply_date_range(record_relation(params[:record_type].to_s, params[:record_id].to_s))
    end

    def enforce_geo(relation)
      return if Settings.features.disable_geo_restriction

      return unless relation.merge(ActiveRecordAudit.geo_restricted_for(Current.user_country)).exists?

      raise Geo::Exceptions::RestrictedEndpoint
    end

    def build_result(base)
      available_types = base.distinct.pluck(:auditable_type).compact.sort
      available_fields = distinct_changed_fields(base)

      filtered = apply_refinements(base)

      audits = filtered.preload(:user, :auditable, :audit_log).
               order(created_at: :desc, id: :desc).
               page(params[:page]).per(page_size)

      {
        list: Panko::ArraySerializer.new(audits, each_serializer: ActiveRecordAuditHistorySerializer).to_a,
        total: filtered.count,
        types: available_types,
        fields: available_fields
      }
    end

    def page_size
      requested_size = (params[:size].presence || DEFAULT_PAGE_SIZE).to_i
      return DEFAULT_PAGE_SIZE if requested_size <= 0

      [requested_size, MAX_PAGE_SIZE].min
    end

    def apply_refinements(relation)
      relation = apply_auditable_type_filter(relation)
      apply_changed_field_filter(relation)
    end

    def apply_auditable_type_filter(relation)
      return relation if params[:auditable_type].blank?

      relation.where(auditable_type: params[:auditable_type])
    end

    def apply_changed_field_filter(relation)
      return relation if params[:changed_field].blank?

      relation.where(CHANGED_FIELD_EXISTS_SQL, field: params[:changed_field])
    end

    def distinct_changed_fields(relation)
      relation.reorder(nil).distinct.pluck(Arel.sql('jsonb_object_keys(audited_changes)')).compact.sort
    rescue ActiveRecord::StatementInvalid
      []
    end

    def record_relation(record_type, record_id)
      base = ActiveRecordAudit.where(auditable_type: record_type, auditable_id: record_id)
      return base unless include_associated_records?

      records = associated_records(record_type, record_id)
      return base if records.blank?

      associated_records_relation(records)
    end

    def associated_records_relation(records)
      records.group_by { |record| record.class.base_class.name }.
        map { |type, recs| ActiveRecordAudit.where(auditable_type: type, auditable_id: recs.map(&:id)) }.
        reduce(ActiveRecordAudit.none) { |relation, scope| relation.or(scope) }
    end

    def associated_records(record_type, record_id)
      model = resolve_model(record_type)
      return [] unless model

      root = model.find_by(id: record_id)
      return [] unless root

      ActiveRecordAuditLogs::AssociatedRecordsResolver.call!(root)
    end

    def resolve_model(record_type)
      model = record_type.safe_constantize
      return unless model.is_a?(Class) && model < ActiveRecord::Base

      model
    end

    def include_associated_records?
      @include_associated_records ||= ActiveModel::Type::Boolean.new.cast(params[:associated_record])
    end

    def apply_date_range(relation)
      range = ActiveRecordAuditLogs::HistoryDateRange.resolve(params[:start_date], params[:end_date])
      relation.where(created_at: range)
    end
  end
end
