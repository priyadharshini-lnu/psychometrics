module Services
  module Hogan
    class AssignAssessmentAndReports
      include Interactor

      def call
        context.group = context.assessment_params[:group]
        context.membership = context.assessment_params[:membership]

        ensure_group_present
        ensure_participant_added_to_group
      end

      private

      def ensure_group_present
        result = Services::Hogan::API::GroupDetails.call(group: context.group)
        return if result.success?

        Services::Hogan::API::CreateGroup.call!(group: context.group)
      end

      def ensure_participant_added_to_group
        return if context.membership.hogan_credential.present?

        password = Devise.friendly_token.first(10)
        result = Services::Hogan::API::AddParticipantToGroup.call!(group: context.group, password: password)
        context.membership.create_hogan_credential(password: password, participant_id: result.participant_id)
      end
    end
  end
end
