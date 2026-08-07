# frozen_string_literal: true

module Administration
  module Templates
    class BlocksController < Administration::BaseController
      skip_before_action :enforce_geo_restriction
      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[show edit update destroy copy toggle_status sidebar preview]
      before_action :skip_authorization, only: [:sidebar]
      before_action :init_breadcrumbs
      append_before_action :pundit_authorize, except: [:sidebar]

      # GET /administration/resources
      def index
        @_filter_form = policy_scope(resource_class).templates.includes(blocks: [:assessment]).ransack(params[:q])
        @_resources = filter_form.result.page(params[:page])

        respond_to do |format|
          format.html
          format.js { render :index, formats: [:js] }
        end
      end

      def new
        @_resource = resource_class.new
      end

      # GET /administration/resources/1/edit
      def edit
        add_breadcrumb resource.decorate.display_name, action: :edit, id: resource.id
      end

      def create
        @_resource = resource_class.new(resource_params)
        resource.assign_attributes(view: :templates)

        respond_to do |format|
          if resource.save
            audit! :create, resource, payload: resource_params
            format.js
          else
            format.js { render :new }
          end
        end
      end

      # PATCH/PUT /administration/resources/1
      def update
        builder = ::Builders::Templates::BlockBuilder.new(resource, block_params)

        if builder.save
          audit! :update, builder.block, payload: block_params
          render json: BlockSerializer.new(
            context: {
              include: '**'
            }
          ).serialize(resource)
        else
          render json: { error: true }, status: 400
        end
      end

      # DELETE /administration/resources/1
      def destroy
        resource.destroy

        respond_to do |format|
          audit! :delete, resource, payload: resource.attributes

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
            audit! :copy, @cloned_resource, payload: { source_id: resource.id }
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
        respond_to do |format|
          format.html do
            redirect_back(
              fallback_location: root_path, success: t('.successfully', name: resource.decorate.display_name)
            )
          end
          format.js
        end
      end

      def preview
        add_breadcrumb resource.decorate.display_name, action: :edit, id: resource.id
        @data = {
          blocks: [BlockSerializer.new(
            context: {
              include: '**'
            }
          ).serialize(resource)]
        }.to_json
      end

      private

      def init_breadcrumbs
        add_breadcrumb I18n.t('administration.breadcrumbs.home'), %i[administration root]
        add_breadcrumb I18n.t('administration.breadcrumbs.question_center'), action: :index
      end

      # Set model
      def set_resource_class
        @_resource_class ||= Block # rubocop:disable Naming/MemoizedInstanceVariableName
      end

      def set_resource
        @_resource = policy_scope(resource_class).templates.find(params[:id])
      end

      def resource_params
        params.expect(resource: [:name, :owner_id, { assign_to_assessment_ids: [] }])
      end

      def block_params
        # rubocop:disable Rails/StrongParametersExpect
        params.require(:block).permit(
          :id, :name, :position, :template_id, :save_as_template, :block_type,
          props: {},
          questions: [
            :id, :block_id, :name, :position, :type, :display_logic,
            :save_as_template, :template_id, :deleted_at,
            { props: {}, validation: {}, required_validation: {}, skip_logic: [] }
          ]
        )
        # rubocop:enable Rails/StrongParametersExpect
      end
    end
  end
end
