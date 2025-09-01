# frozen_string_literal: true

module Administration
  module Templates
    class QuestionsController < Administration::BaseController
      skip_before_action :enforce_geo_restriction
      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[show edit update destroy copy toggle_status sidebar]
      before_action :skip_authorization, only: [:sidebar]
      before_action :init_breadcrumbs
      append_before_action :pundit_authorize, except: [:sidebar]

      # GET /administration/resources
      def index
        @_filter_form = policy_scope(resource_class).templates.
                        includes(questions: [block: [:assessment]]).ransack(params[:q])
        @_resources = filter_form.result.page(params[:page])

        respond_to do |format|
          format.html
          format.js { render :index, formats: [:js] }
        end
      end

      def new
        @_resource = resource_class.new
      end

      def edit
        add_breadcrumb resource.decorate.display_name, action: :edit, id: resource.id
      end

      def create
        @_resource = resource_class.new(resource_params)
        resource.created_by = current_user
        resource.updated_by = current_user
        resource.assign_attributes(view: :templates, type: 'MultipleChoice')

        respond_to do |format|
          if resource.save
            audit! :create, resource, payload: params, user: current_user
            format.js
          else
            format.js { render :new }
          end
        end
      end

      # PATCH/PUT /administration/resources/1
      def update
        resource.updated_by = current_user

        question = ::Builders::Templates::QuestionBuilder.new(resource, question_params)
        if question.save
          audit! :update, resource, payload: question_params, user: current_user
          render json: { data: QuestionSerializer.new(
            context: {
              include: '**'
            }
          ).serialize(resource) }
        else
          render json: { error: true }, status: 400
        end
      end

      # DELETE /administration/resources/1
      def destroy
        resource.destroy
        audit! :delete, resource, payload: resource.attributes
        respond_to do |format|
          format.html do
            redirect_back(
              fallback_location: root_path, success: t('.successfully', name: resource.decorate.display_name)
            )
          end
          format.js
        end
      end

      def copy
        @cloned_resource = resource.clone
        respond_to do |format|
          if @cloned_resource.save
            audit! :copy, resource, payload: { source_id: resource.id }
            format.js
          else
            format.js { render :error, locals: { message: t('.error', name: resource.decorate.display_name) } }
          end
        end
      end

      # Change resources's status to active/disabled
      #
      def toggle_status
        resource.toggle!(:disabled)
        audit! :toggle_status, resource, payload: { disabled: resource.disabled }
        respond_to do |format|
          format.html do
            redirect_back(
              fallback_location: root_path, success: t('.successfully', name: resource.decorate.display_name)
            )
          end
          format.js
        end
      end

      private

      def init_breadcrumbs
        add_breadcrumb I18n.t('administration.breadcrumbs.home'), %i[admin root]
        add_breadcrumb I18n.t('administration.breadcrumbs.question_center'), action: :index
      end

      # Set model
      def set_resource_class
        @_resource_class ||= Question # rubocop:disable Naming/MemoizedInstanceVariableName
      end

      def set_resource
        @_resource = policy_scope(resource_class).templates.find(params[:id])
      end

      def resource_params
        params.require(:resource).permit(:name, :owner_id, assign_to_assessment_ids: [])
      end

      def question_params
        permitted_params = params.require(:question).permit(
          :id, :block_id, :name, :position, :type, :display_logic, :template_id, :save_as_template,
          props: {},
          validation: {},
          required_validation: {},
          skip_logic: []
        )

        if permitted_params[:props].present?
          permitted_params[:props] = Utility::Hash.sanitize_nested_hash(permitted_params[:props])
        end

        permitted_params
      end
    end
  end
end
