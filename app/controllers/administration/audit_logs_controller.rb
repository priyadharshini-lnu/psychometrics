# frozen_string_literal: true

module Administration
  class AuditLogsController < Administration::BaseController
    skip_before_action :enforce_geo_restriction
    before_action :authenticate_user!
    before_action :set_log, only: %i[show destroy]

    render_entrypoint %i[index show], element: 'audit-logs', entry: 'admin/audit_logs'

    def index
      ApplicationRecord.read_from_replica do
        fetch_and_render_logs
      end
    end

    def show
      authorize @log
      siem_log_sensitive_operation(
        context: 'Audit Log Details Access',
        action_description: "accessed audit log detail #{@log.id}",
        action_type: 'SecurityAudit',
        resource: 'AuditLog'
      )
      render json: AuditLogInfoSerializer.new.serialize(@log)
    end

    def actions
      authorize(::AuditLog)
      types = policy_scope(::AuditLog).where(record_type: params[:type]).pluck(:action).uniq
      render json: types
    end

    private

    def fetch_and_render_logs
      @q = policy_scope(::AuditLog).geo_scoped(Current.user_country).ransack(params[:filters])

      @logs = @q.result.
              select('audit_logs.id, audit_logs.action, audit_logs.created_at, audit_logs.user_id,
                 audit_logs.client_id, audit_logs.project_id, audit_logs.campaign_id,
                 audit_logs.record_id, audit_logs.record_type').
              includes(:user, :client, :project, :campaign).
              order(created_at: :desc).
              page(params[:page]).
              per(params[:size] || 25)

      total_count = @q.result.count
      serialized_logs = Panko::ArraySerializer.new(
        @logs,
        each_serializer: AuditLogSerializer
      ).to_a

      types = Rails.cache.read('audit_log_record_types') || []
      actions = Rails.cache.read('audit_log_actions') || []

      siem_log_sensitive_operation(
        context: 'Audit Logs Access',
        action_description: 'accessed audit logs list',
        action_type: 'SecurityAudit',
        resource: 'AuditLog'
      )

      render json: {
        list: serialized_logs,
        total: total_count,
        types: types,
        actions: actions
      }
    end

    def set_log
      ActiveRecord::Base.connected_to(role: :reading) do
        @log = policy_scope(::AuditLog).includes(:user, :impersonator, :active_record_audits, :client, :project,
                                                 :campaign).find(params[:id])
      end
    end
  end
end
