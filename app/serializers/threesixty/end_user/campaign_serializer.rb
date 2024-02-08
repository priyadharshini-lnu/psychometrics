# frozen_string_literal: true

module Threesixty
  module EndUser
    class CampaignSerializer < Threesixty::EndUser::BaseCampaignSerializer
      attributes :id, :type, :reports, :assessment_name, :instructions,
                 :evaluations_counters, :nominations_counters, :reports_counters, :nominations,
                 :managed_subjects, :is_subject, :status

      has_many :evaluations, serializer: Threesixty::EndUser::EvaluationSerializer
      has_many :reports, serializer: Threesixty::UserReportSerializer
      has_one :options, serializer: CampaignOptionsSerializer

      def managed_subjects
        return [] unless options.participants.dig('manager', 'can_approves_evaluations')

        all_managed_subjects.filter_map do |subject|
          data = ::Threesixty::EndUser::ManagedSubjectSerializer.
                 new(subject, scope: current_user, scope_name: :current_user).
                 to_hash(include: '**')
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

      def options
        object.option
      end

      def nominations
        is_nomination_complete_hash = Threesixty::Subjects::IsNominationRequirementComplete.
                                      call!(object.campaign.threesixty_campaign, nomination_users)

        nomination_subjects.map do |subject|
          Threesixty::EndUser::CampaignNomineeSerializer.
            new(subject,
                current_user: current_user,
                is_nomination_completed: is_nomination_complete_hash[subject.user_id]).
            to_hash
        end
      end

      def status
        object.campaign.status
      end

      def is_subject
        object.subjects.exists?(user_id: instance_options[:current_user].id)
      end

      def nomination_users
        nomination_subjects.map(&:user)
      end

      def current_user
        instance_options[:current_user]
      end
    end
  end
end
