# frozen_string_literal: true

module Administration
  class AdminJobsController < Administration::BaseController
    before_action :skip_authorization
    skip_before_action :init_state
    skip_before_action :enforce_geo_restriction

    def index
      jobs = policy_scope(AdminJobRecord).
             where(parent_job_id: nil).
             includes(:owner, :file_attachment, :subjobs).
             order(created_at: :desc).
             offset(params[:offset] || 0).
             limit(20).
             all

      AdminJobs::Base.preload_campaigns_for(jobs) do
        render json: {
          jobs: Panko::ArraySerializer.new(
            jobs,
            each_serializer: AdminJobRecordSerializer
          ).to_a,
          unread: policy_scope(AdminJobRecord).where(read: false).count
        }
      end
    end

    def read_all
      policy_scope(AdminJobRecord).where(read: false).update_all(read: true)
      render json: :ok
    end

    def read
      record = policy_scope(AdminJobRecord).find(params[:id])
      record.update(read: true)
      render json: AdminJobRecordSerializer.new.serialize(record)
    end
  end
end
