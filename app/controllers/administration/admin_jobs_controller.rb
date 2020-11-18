# frozen_string_literal: true

module Administration
  class AdminJobsController < Administration::BaseController
    before_action :skip_authorization, only: %i[index read_all]

    def index
      jobs = policy_scope(AdminJobRecord).order(created_at: :desc).all
      render json: {
        jobs: jobs.map { |job| AdminJobRecordSerializer.new(job) },
        unread: policy_scope(AdminJobRecord).where(read: false).count
      }
    end

    def read_all
      policy_scope(AdminJobRecord).where(read: false).update_all(read: true)
      render json: :ok
    end
  end
end
