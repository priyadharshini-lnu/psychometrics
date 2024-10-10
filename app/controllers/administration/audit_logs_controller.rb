# frozen_string_literal: true

module Administration
  class AuditLogsController < Administration::BaseController
    before_action :authenticate_user!
    before_action :set_log, only: %i[show destroy]

    render_entrypoint %i[index show], element: 'audit-logs', entry: 'admin/audit_logs'

    def index
      ApplicationRecord.read_from_replica do
        @q = policy_scope(::AuditLog).ransack(params[:filters])

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

        render json: {
          list: serialized_logs,
          total: total_count,
          types: types,
          actions: actions
        }
      end
    end

    def show
      authorize @log
      render json: AuditLogInfoSerializer.new.serialize(@log)
    end

    def actions
      authorize(::AuditLog)
      types = policy_scope(::AuditLog).where(record_type: params[:type]).pluck(:action).uniq
      render json: types
    end

    private

    def set_log
      ActiveRecord::Base.connected_to(role: :reading) do
        @log = policy_scope(::AuditLog).includes(:user, :active_record_audits, :client, :project,
                                                 :campaign).find(params[:id])
      end
    end
  end
end
