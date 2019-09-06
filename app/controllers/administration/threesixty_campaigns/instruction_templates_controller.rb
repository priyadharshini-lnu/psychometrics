# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class InstructionTemplatesController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[update]
      append_before_action :pundit_authorize

      def index
        skip_policy_scope
        render json: threesixty_campaign.instruction_templates
      end

      def update
        form = ::Threesixty::InstructionTemplateForm.from_params(params[:instruction_template])
        if form.valid?
          resource.update!(form.attributes)
          render json: :ok
        else
          render json: { errors: form.errors.messages }, status: :bad_request
        end
      end

      private

      def set_resource_class
        @_resource_class ||= ::Threesixty::InstructionTemplate
      end
    end
  end
end
