# frozen_string_literal: true

module Threesixty
  module EndUser
    class CampaignSerializer < Threesixty::EndUser::BaseCampaignSerializer
      attributes :id, :type, :assessment_name, :instructions,
                 :evaluations_counters, :nominations_counters, :reports_counters, :nominations,
                 :managed_subjects, :is_subject, :status, :evaluations, :reports, :options, :nomination_subjects

      def evaluations
        Panko::ArraySerializer.new(
          super,
          each_serializer: Threesixty::EndUser::EvaluationSerializer,
          context: {
            current_user: current_user
          }
        ).to_a
      end

      def reports
        Panko::ArraySerializer.new(
          super,
          each_serializer: Threesixty::UserReportSerializer,
          context: {
            current_user: current_user,
            current_option: current_option,
            include: '**'
          }
        ).to_a
      end

      def managed_subjects
        return [] unless current_option.participants.dig('manager', 'can_approves_evaluations')

        all_managed_subjects.filter_map do |subject|
          data = ::Threesixty::EndUser::ManagedSubjectSerializer.new(
            context: {
              scope: current_user, scope_name: :current_user, include: '**'
            }
          ).serialize(subject)
          data[:evaluators].present? ? data : nil
        end
      end

      def instructions
        object.instruction_templates.enabled.includes(:translations).map do |instruction|
          {
            name: instruction.name,
            content: Threesixty::PipedText::Perform.call!(instruction.content,
                                                          threesixty_campaign: object.campaign.threesixty_campaign,
                                                          user: current_user)
          }
        end
      end

      def current_option
        object.option
      end

      def options
        CampaignOptionsSerializer.new(
          context: { current_user: current_user }
        ).serialize(current_option)
      end

      def nominations
        is_nomination_complete_hash = Threesixty::Subjects::IsNominationRequirementComplete.
                                      call!(object.campaign.threesixty_campaign, nomination_users)
        Panko::ArraySerializer.new(
          nomination_subjects,
          each_serializer: Threesixty::EndUser::CampaignNomineeSerializer,
          context: {
            current_user: current_user,
            is_nomination_complete_hash: is_nomination_complete_hash
          }
        ).to_a
      end

      def status
        object.campaign.status
      end

      def is_subject
        object.subjects.exists?(user_id: context[:current_user].id)
      end

      def nomination_users
        nomination_subjects.map(&:user)
      end

      def current_user
        context[:current_user]
      end
    end
  end
end
