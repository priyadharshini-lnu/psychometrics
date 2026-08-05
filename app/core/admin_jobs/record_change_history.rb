# frozen_string_literal: true

module AdminJobs
  class RecordChangeHistory < BaseExportCsv
    Error = Class.new(StandardError)

    HEADERS = [
      'Audit ID',
      'Record Type',
      'Record Name',
      'Record ID',
      'Version',
      'Audit Type',
      'Event At',
      'Changes',
      'Actor Id',
      'Actor Email',
      'Action',
      'Request UUID',
      'Audit Log ID'
    ].freeze

    def self.validate(data, _owner)
      payload = data.with_indifferent_access
      record_type = payload[:record_type].to_s
      record_id = payload[:record_id].to_i

      raise Error, 'record_type is required' if record_type.blank?
      raise Error, 'record_id is required' if record_id.zero?

      validate_date_range(payload[:start_date], payload[:end_date])
      validate_record(record_type, record_id)
    end

    def self.validate_date_range(start_date, end_date)
      ActiveRecordAuditLogs::HistoryDateRange.resolve(start_date, end_date)
    rescue ActiveRecordAuditLogs::HistoryDateRange::Error => e
      raise Error, e.message
    end

    def self.validate_record(record_type, record_id)
      model = resolve_model!(record_type)

      exists = ActsAsTenant.without_tenant { model.exists?(id: record_id) }
      raise Error, "Record not found for #{record_type}##{record_id}" unless exists
    end

    def self.resolve_model!(record_type)
      model = record_type.safe_constantize
      raise Error, "Invalid record type: #{record_type}" unless model.is_a?(Class) && model < ActiveRecord::Base

      model
    end

    def call
      ActsAsTenant.without_tenant { super }
    end

    def generate_details
      name = target_record.try(:name) || target_record&.id
      [["#{record_type_name} | #{name}", file_link]]
    end

    def valid?
      target_record.present?
    end

    private

    def headers
      HEADERS
    end

    def data_row(audit)
      actor = audit.user

      [
        audit.id,
        audit.auditable_type,
        audit.auditable&.try(:name),
        audit.auditable_id,
        audit.version,
        audit.action,
        audit.created_at,
        serialize_changes(audit.audited_changes),
        actor&.id,
        actor&.email,
        audit.audit_log&.action,
        audit.request_uuid,
        audit.audit_log&.id
      ]
    end

    def records_for_export
      relation = build_audits_relation.where(created_at: history_range)
      relation = relation.where(auditable_type: auditable_type_filter) if auditable_type_filter.present?
      if changed_field_filter.present?
        relation = relation.where('jsonb_exists(audited_changes, :field)', field: changed_field_filter)
      end
      enforce_geo_for(relation)

      relation.includes(:auditable, audit_log: :user).order(created_at: :desc, id: :desc)
    end

    def enforce_geo_for(relation)
      return if Settings.features.disable_geo_restriction

      return unless relation.merge(ActiveRecordAudit.geo_restricted_for(Current.user_country)).exists?

      raise Geo::Exceptions::RestrictedEndpoint
    end

    def build_audits_relation
      records = records_for_audits
      return ActiveRecordAudit.none if records.blank?

      associated_records_relation(records)
    end

    def associated_records_relation(records)
      records.group_by { |record| record.class.base_class.name }.
        map { |type, recs| ActiveRecordAudit.where(auditable_type: type, auditable_id: recs.map(&:id)) }.
        reduce(ActiveRecordAudit.none) { |relation, scope| relation.or(scope) }
    end

    def records_for_audits
      @records_for_audits ||= if include_associated_records?
                                ActiveRecordAuditLogs::AssociatedRecordsResolver.call!(target_record)
                              else
                                [target_record].compact
                              end
    end

    def include_associated_records?
      ActiveModel::Type::Boolean.new.cast(record.data['associated_record'])
    end

    def target_record
      @target_record ||= begin
        model = self.class.resolve_model!(record_type_name)
        ActsAsTenant.without_tenant { model.find_by(id: record_id) }
      end
    end

    def record_type_name
      record.data['record_type']
    end

    def record_id
      record.data['record_id']
    end

    def auditable_type_filter
      record.data['auditable_type']
    end

    def changed_field_filter
      record.data['changed_field']
    end

    def history_range
      @history_range ||= ActiveRecordAuditLogs::HistoryDateRange.resolve(
        record.data['start_date'], record.data['end_date']
      )
    end

    def serialize_changes(changes)
      ActiveRecordAuditLogs::ScrubSensitiveData.call!(changes).to_json
    end

    def file_name
      "#{record_type_name.to_s.underscore}-#{record_id}-change-history-#{record.id}.csv"
    end
  end
end
