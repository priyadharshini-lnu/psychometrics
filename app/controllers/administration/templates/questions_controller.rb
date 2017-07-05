module Administration
  module Templates
    class QuestionsController < Administration::BaseController
      prepend_before_action :set_resource_class
      before_action :set_resource, only: [:show, :edit, :configure, :update, :destroy, :copy, :toggle_status, :sidebar, :new_assign]
      before_action :skip_authorization, only: [:sidebar]
      before_action :init_breadcrumbs
      append_before_action :pundit_authorize, except: [:sidebar]

      # GET /administration/resources
      def index
        @_filter_form = policy_scope(resource_class).templates.includes(questions: [block: [:assessment]]).search(params[:q])
        @_resources = filter_form.result.page(params[:page])

        respond_to do |format|
          format.html
          format.js { render :index, formats: [:js] }
        end
      end

      def new
        @_resource = resource_class.new
      end

      def create
        resource = resource_class.new(resource_params)
        resource.assign_attributes({ view: :templates, type: 'MultipleChoice' })

        respond_to do |format|
          if resource.save
            format.js
          else
            format.js { render :new }
          end
        end
      end

      def configure
        add_breadcrumb resource.decorate.display_name, { action: :edit, id: resource.id }
      end

      # PATCH/PUT /administration/resources/1
      def update
        question = ::Builders::Templates::QuestionBuilder.new(resource, params.require(:question))
        if question.save
          render json: { data: QuestionSerializer.new(resource).to_hash(include: '**') }
        else
          render json: { error: true }, status: 400
        end
      end

      # DELETE /administration/resources/1
      def destroy
        resource.destroy
        respond_to do |format|
          format.html { redirect_to(:back, success: t('.successfully', name: resource.decorate.display_name)) }
          format.js
        end
      end

      def copy
        @cloned_resource = resource.clone
        respond_to do |format|
          if @cloned_resource.save
            format.js
          else
            format.js { render :error, locals: { message: t('.error', { name: resource.decorate.display_name }) } }
          end
        end
      end

      # Change resources's status to active/disabled
      #
      def toggle_status
        resource.toggle!(:disabled)
        respond_to do |format|
          format.html { redirect_to(:back, success: t('.successfully', name: resource.decorate.display_name)) }
          format.js
        end
      end

      def new_assign
      end

      private

      def init_breadcrumbs
        add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
        add_breadcrumb I18n.t('administration.breadcrumbs.question_center'), { action: :index }
      end

      # Set model
      def set_resource_class
        @_resource_class ||= Question
      end

      def set_resource
        @_resource = policy_scope(resource_class).templates.find(params[:id])
      end

      def resource_params
        params.require(:resource).permit(:name, :owner_id, assign_to_assessment_ids: [])
      end
    end
  end
end
