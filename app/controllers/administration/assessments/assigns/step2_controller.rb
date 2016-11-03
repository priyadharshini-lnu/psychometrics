module Administration
  module Assessments
    module Assigns
      class Step2Controller < Administration::BaseController
        before_action :set_assessment
        before_action :set_resource_class
        append_before_action :init_assign, only: [:show]
        append_before_action :init_breadcrumbs
        append_before_action :pundit_authorize

        def show
          @clients = policy_scope(::Client).where(id: @assign.client_ids)
          @admins = policy_scope(::Membership).
                    select('memberships.*', 'clients.name as client_name').
                    joins(:client).
                    join_user.
                    where(client_id: @assign.client_ids).
                    where(users: { role: User::USER_ROLES[:admin] }).
                    group_by(&:client_name)
          @managers = policy_scope(::Membership).
                      select('memberships.*', 'clients.name as client_name').
                      joins(:client).
                      join_user.
                      where(client_id: @assign.client_ids).
                      where(users: { role: User::USER_ROLES[:manager] }).
                      group_by(&:client_name)
          @filter_form = ::Membership.search
        end

        def update
          @assign = AssignForm.new(resource_params)
          new_user_ids = (@assign.user_ids + @assign.manager_ids + @assign.admin_ids)
          Assign.transaction do
            # Remove assigns that was removed
            delete_user_ids = @assessment.membership_ids - new_user_ids
            Assign.where(membership_id: delete_user_ids, assessment_id: @assessment.id).delete_all if delete_user_ids.present?
            # Update or Create assigns
            new_user_ids.each do |user_id|
              assign = Assign.find_or_initialize_by(assessment_id: @assessment.id, membership_id: user_id)
              assign.role = :member
              assign.role = :manager if @assign.manager_ids.include?(user_id)
              assign.role = :admin if @assign.admin_ids.include?(user_id)
              assign.save
            end
          end
          redirect_to(administration_assessment_finish_path)
        end

        def not_selected_users
          @search = policy_scope(::Membership).join_user.distinct.search(params[:q])
          # Limit to use only assigned clients
          @search.client_id_in = @assessment.client_ids if @search.client_id_in.blank?
          @users = @search.result
          respond_to do |format|
            format.json { render json: ::ActiveModel::Serializer::CollectionSerializer.new(@users, serializer: MembershipSerializer).to_json }
          end
        end

        def selected_users
          @search = policy_scope(::Membership).join_user.distinct.search(params[:q])
          # Limit to use only assigned clients
          @search.client_id_in = @assessment.client_ids if @search.client_id_in.blank?
          @search.include_ids = nil if @search.include_ids.blank?
          @users = @search.result
          respond_to do |format|
            format.json { render json: ::ActiveModel::Serializer::CollectionSerializer.new(@users, serializer: MembershipSerializer).to_json }
          end
        end

        private

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
