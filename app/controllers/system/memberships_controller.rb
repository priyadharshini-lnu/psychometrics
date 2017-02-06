module System
  class MembershipsController < BaseController
    def index
      form = policy_scope(Membership).search(params[:q])
      @resources = form.result.join_user

      respond_to do |format|
        format.json
      end
    end
  end
end
