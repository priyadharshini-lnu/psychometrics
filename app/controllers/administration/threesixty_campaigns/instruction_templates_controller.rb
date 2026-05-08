# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class InstructionTemplatesController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[update show]
      append_before_action :pundit_authorize

      def index
        skip_policy_scope
        render json: threesixty_campaign.instruction_templates.order(:name)
      end

      def show
        list = params[:locales].map do |locale|
          Mobility.with_locale(locale) do
            ::Threesixty::InstructionTemplateLocaleSerializer.new(context: { locale: locale }).serialize(resource)
          end
        end
        render json: { list: list, available_locales: resource.translations.map(&:locale) }
      end

      def update
        form = ::Threesixty::InstructionTemplateForm.from_params(params[:instruction_template])
        if form.valid?
          Mobility.with_locale(params[:locale]) do
            resource.update!(form.attributes)
          end
          audit! :update_instruction_template, resource, payload: form.attributes,
            campaign: threesixty_campaign.campaign
          render json: :ok
        else
          render json: { errors: form.errors.messages }, status: 400
        end
      end

      private

      def set_resource_class
        @_resource_class ||= ::Threesixty::InstructionTemplate # rubocop:disable Naming/MemoizedInstanceVariableName
      end
    end
  end
end
