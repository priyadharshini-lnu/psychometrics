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
          users = policy_scope(::User).includes(:clients).where(id: (@assign.user_ids + @assign.manager_ids + @assign.admin_ids))
          Assign.transaction do
            # Remove assigns that was removed
            Assign.where({
                user_id: @assessment.user_ids - (@assign.user_ids + @assign.manager_ids + @assign.admin_ids),
                assessment_id: @assessment.id
              }).delete_all
            users.find_each do |user|
              client_ids = user.clients.map(&:id) & @assign.client_ids
              client_ids.each do |client_id|
                assign = Assign.find_or_initialize_by(assessment_id: @assessment.id, client_id: client_id, user_id: user.id)
                assign.role = :member
                assign.role = :manager if @assign.manager_ids.include?(user.id)
                assign.role = :admin if @assign.admin_ids.include?(user.id)
                assign.save
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
          @assign = AssignForm.new(@assessment.assign_form_attributes || {})
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
