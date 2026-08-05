# frozen_string_literal: true

module Api
  class V2::Administration::RecordChangeHistoriesController < Api::V2::Administration::BaseController
    include AsyncRequestHandler

    skip_before_action :enforce_geo_restriction
    before_action :authenticate_user!
    before_action :log_search_access, only: :search

    async_request :search,
                  handler: ActiveRecordAuditLogs::RecordHistorySearchHandler,
                  permit_params: ->(params) { search_params(params) }

    def auditable_types
      types = Rails.cache.fetch('active_record_auditable_types', expires_in: 1.hour) do
        ApplicationRecord.read_from_replica do
          ActsAsTenant.without_tenant { ActiveRecordAudit.distinct.pluck(:auditable_type).compact.sort }
        end
      end

      render json: types
    end

    def export
      validate_export_geo_access!

      AdminJob.call(:superadmin_record_change_history, export_params.to_h, current_user)

      siem_log_sensitive_operation(
        context: 'Record Change History Export Requested',
        action_description: "requested record change history export for #{params[:record_type]} #{params[:record_id]}",
        action_type: 'SecurityAudit',
        resource: 'ActiveRecordAudit'
      )

      render json: { message: I18n.t('admin.audit_logs_export_queued') }, status: :accepted
    rescue ActiveRecordAuditLogs::HistoryDateRange::Error, AdminJobs::RecordChangeHistory::Error => e
      render json: { error: e.message }, status: :unprocessable_entity
    end

    def revision
      record_type = params[:record_type].to_s
      record_id = params[:record_id].to_s
      version = params[:version].to_i
      return render json: { attributes: {} } if record_type.blank? || record_id.blank? || version.zero?

      ApplicationRecord.read_from_replica do
        ActsAsTenant.without_tenant do
          scope = ActiveRecordAudit.where(auditable_type: record_type, auditable_id: record_id)
          enforce_geo_for(scope)

          reconstructed = scope.find_by(version: version)&.revision

          render json: { attributes: ActiveRecordAuditLogs::ScrubSensitiveData.call!(reconstructed&.attributes || {}) }
        end
      end
    end

    private

    def search_params(params)
      params.permit(:record_type, :record_id, :request_uuid, :start_date, :end_date,
                    :associated_record, :auditable_type, :changed_field, :page, :size)
    end

    def pundit_authorize
      authorize(
        nil,
        nil,
        policy_class: Api::Administration::RecordChangeHistoryPolicy
      )
    end

    def log_search_access
      target = params[:request_uuid].presence || "#{params[:record_type]} #{params[:record_id]}"
      siem_log_sensitive_operation(
        context: 'Audit Record History Access',
        action_description: "traced change history (#{target})",
        action_type: 'SecurityAudit',
        resource: 'ActiveRecordAudit'
      )
    end

    def export_params
      params.permit(
        :record_type,
        :record_id,
        :start_date,
        :end_date,
        :associated_record,
        :auditable_type,
        :changed_field
      )
    end

    def enforce_geo_for(relation)
      return if Settings.features.disable_geo_restriction

      return unless relation.merge(ActiveRecordAudit.geo_restricted_for(Current.user_country)).exists?

      raise Geo::Exceptions::RestrictedEndpoint
    end

    def validate_export_geo_access!
      return if params[:record_type].blank? || params[:record_id].blank?

      relation = ActiveRecordAudit.where(auditable_type: params[:record_type].to_s,
                                         auditable_id: params[:record_id].to_s)

      if params[:start_date].present? || params[:end_date].present?
        range = ActiveRecordAuditLogs::HistoryDateRange.resolve(params[:start_date], params[:end_date])
        relation = relation.where(created_at: range)
      end

      enforce_geo_for(relation)
    end
  end
end
