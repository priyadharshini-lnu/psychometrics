# frozen_string_literal: true

module Administration
  module ThreesixtyCampaigns
    class EmailTemplatesController < Administration::ThreesixtyCampaigns::BaseController
      prepend_before_action :set_resource_class
      before_action :set_resource, only: %i[show edit]
      append_before_action :pundit_authorize

      def index
        skip_policy_scope
        # render json: threesixty_campaign.email_templates
        render json:  [
          {
            id: 1,
            category: 'Invitations',
            name: 'Subject invite',
            from: 'Signify360',
            subject: '360 Degree Assessment at Signify - Invitation to Participate ',
            reply_to_email: 'signify@cc.com',
            content: 'First template'
          },
          {
            id: 2,
            category: 'Invitations',
            name: 'Evaluator invite',
            from: 'Signify360',
            subject: '360 Degree Assessment at Signify - Nomination for Feedback',
            reply_to_email: 'signify@cc.com',
            content: "Second template"
          }
        ]
      end

      def update
        render json: :ok
      end

      private

      def set_resource_class
        @_resource_class ||= ::Threesixty::EmailTemplate
      end
    end
  end
end
