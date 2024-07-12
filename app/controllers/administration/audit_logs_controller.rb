# frozen_string_literal: true

module Administration
  class AuditLogsController < Administration::BaseController
    before_action :authenticate_user!
    before_action :set_log, only: %i[show destroy]

    render_entrypoint %i[index show], element: 'audit-logs', entry: 'admin/audit_logs'

    def index
      @q = policy_scope(::AuditLog).ransack(params[:filters])

      @logs = @q.result.includes(:user, :active_record_audits, :client, :project, :campaign).
              order(id: :desc).page(params[:page]).per(params[:size] || 25)

      serialized_logs = Panko::ArraySerializer.new(
        @logs,
        each_serializer: AuditLogSerializer
      ).to_a

      render json: {
        list: serialized_logs,
        total: @q.result.count,
        types: policy_scope(::AuditLog).distinct(:record_type).pluck(:record_type).compact.sort,
        actions: policy_scope(::AuditLog).distinct(:action).pluck(:action).compact.sort
      }
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
      @log = policy_scope(::AuditLog).includes(:user, :active_record_audits, :client, :project,
                                               :campaign).find(params[:id])
    end
  end
end
