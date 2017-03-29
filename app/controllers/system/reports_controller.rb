module System
  class ReportsController < BaseController
    def index
      form = policy_scope(Report).search(params[:q])
      @resources = form.result

      respond_to do |format|
        format.json
      end
    end
  end
end
