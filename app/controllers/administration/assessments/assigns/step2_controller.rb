module Administration
  module Assessments
    module Assigns
      class Step2Controller < Administration::BaseController
        before_action :set_assessment
        before_action :set_resource_class
        append_before_action :init_assign, except: [:update]
        append_before_action :init_breadcrumbs
        append_before_action :pundit_authorize

        def show
          @clients = policy_scope(::Client).all.includes(:admins, :managers).where(id: @assign.client_ids).references(:admins, :managers)
          @filter_form = ::User.search
        end

        def update
          @assign = AssignForm.new(resource_params)
          clients = policy_scope(::Client).where(id: @assign.client_ids)
          Assign.transaction do
            clients.find_each do |client|
              # Init assign params
              assign_params = { assessment_id: @assessment.id, client_id: client.id }

              # Update clients
              client_params = {
                assessment_ids: [client.assessment_ids, @assessment.id].flatten.uniq,
                report_ids: [client.report_ids, @assign.report_ids].flatten.uniq
              }
              client.update_attributes(client_params)

              # Assign admins to assessments
              client.admins.where(id: @assign.admin_ids).find_each do |admin|
                Assign.create(assign_params.merge({ user_id: admin.id, role: :admin }))
              end
              # Assign managers to assessments
              client.managers.where(id: @assign.manager_ids).find_each do |manager|
                Assign.create(assign_params.merge({ user_id: manager.id, role: :manager }))
              end
              # Assign users to assessments
              client.users.where(id: @assign.user_ids).find_each do |user|
                Assign.create(assign_params.merge({ user_id: user.id, role: :member }))
              end
            end
          end
          redirect_to(administration_assessment_finish_path)
        end

        def not_selected_users
          @search = policy_scope(::User).distinct.search(params[:q])
          @search.clients_id_in = @assign.client_ids if @search.clients_id_in.blank?
          @users = @search.result
          respond_to do |format|
            format.json { render json: ::ActiveModel::Serializer::CollectionSerializer.new(@users, serializer: UserSerializer).to_json }
          end
        end

        def selected_users
          @search = policy_scope(::User).distinct.search(params[:q])
          @search.clients_id_in = @assign.client_ids if @search.clients_id_in.blank?
          @search.include_ids = nil if @search.include_ids.blank?
          @users = @search.result
          respond_to do |format|
            format.json { render json: ::ActiveModel::Serializer::CollectionSerializer.new(@users, serializer: UserSerializer).to_json }
          end
        end

        private

        def token_session
          @token_session ||= "assign_form_#{@assessment.id}_#{current_user.id}"
        end

        def init_assign
          @assign = AssignForm.new(session[token_session] || {})
          redirect_to(administration_assessment_step1_path) && return if @assign.client_ids.blank? || @assign.report_ids.blank?
        end

        def init_breadcrumbs
          add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
          add_breadcrumb I18n.t('administration.breadcrumbs.assessments'), [:administration, :assessments]
          add_breadcrumb t('.title', name: @assessment.decorate.display_name), request.path
        end

        # Set model
        def set_resource_class
          @resource_class ||= ::Assign
        end

        def set_assessment
          @assessment = policy_scope(::Assessment).includes(:reports).find(params[:assessment_id])
        end

        def resource_params
          params.fetch(:assign, {}).permit(:client_ids, :report_ids, :user_ids, admin_ids: [], manager_ids: [])
        end

        # Authorisation user
        def pundit_authorize
          authorize [:assessments, @resource_class]
        end
      end
    end
  end
end
