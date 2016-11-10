module Administration
  module Clients
    module Users
      class AssignsController < Administration::BaseController
        prepend_before_action :set_resource_class
        before_action :set_membership
        before_action :init_breadcrumbs
        append_before_action :pundit_authorize

        def index
          @filter_form = policy_scope(::Assign).where(id: @membership.assign_ids).includes(:assessment).search(params[:q])
          @resources = @filter_form.result.page(params[:page])
          @reports = @membership.client.reports.
                     available_to_view.
                     group_by(&:assessment_id)
          respond_to do |format|
            format.html
            format.js { render :index, formats: [:js] }
          end
        end

        def new
          @resource = Assign.new
        end

        def create
          @assessment = @client.assessments.find(assign_params[:assessment_id])
          @resource = @assessment.assigns.build
          @resource.client_id = @client.id
          @resource.membership_id = @membership.id
          respond_to do |format|
            if @resource.save
              format.js
            else
              format.js { render :new }
            end
          end
        end

        def destroy
          @resource = @client.assigns.find(params[:id])
          @resource.destroy
          respond_to do |format|
            format.html { redirect_to(:back, success: t('.successfully')) }
            format.js
          end
        end

        private

        def set_resource_class
          @resource_class ||= Assign
        end

        def init_breadcrumbs
          add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
          add_breadcrumb I18n.t('administration.breadcrumbs.clients'), [:administration, @client, :users]
          add_breadcrumb @membership.client.decorate.display_name, [:administration, @client, :users]
          add_breadcrumb @membership.user.decorate.display_name, '#'
          add_breadcrumb I18n.t('administration.breadcrumbs.reports'), { action: :index }
        end

        def set_membership
          @membership = policy_scope(::Membership).join_user.includes(:client, :assigns).find(params[:user_id])
          @client = @membership.client
        end

        def set_client
        end

        def assign_params
          params.require(:resource).permit(:assessment_id)
        end

        # Authorisation user
        def pundit_authorize
          authorize @resource || @resource_class
        end
      end
    end
  end
end
