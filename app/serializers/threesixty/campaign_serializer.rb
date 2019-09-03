module Threesixty
  class CampaignSerializer < ActiveModel::Serializer
    attributes :id, :reports, :type, :assessment_name, :questions_count, :timing,
               :mindmill, :hogan, :instructions, :logo,
               :evaluations_counters, :nominations_counters, :reports_counters, :nominations,
               :managed_subjects

    has_many :evaluations, serializer: Threesixty::EndUser::EvaluationSerializer
    has_many :reports, serializer: UsersReportSerializer
    has_one :options, serializer: CampaignOptionsSerializer

    def managed_subjects
      return [] unless instance_options[:managed_subjects]

      instance_options[:managed_subjects].map do |subject|
        data = ::Threesixty::EndUser::ManagedSubjectSerializer.new(subject, scope: current_user, scope_name: :current_user).
          to_hash(include: '**')
        data[:evaluators].present? ? data : nil
      end.compact
    end

    def nominations_counters
      {
        total_nominations: nominations.count,
        completed_nominations: Threesixty::Subjects::IsNominationRequirementComplete.call!(object, nomination_users).count{|_,v| v}
      }
    end

    def evaluations_counters
      Threesixty::Participants::CalcCounters.call!([current_user.id], object)[current_user.id]
    end

    def reports_counters
      {
        total_reports: reports.count,
        completed_reports: reports.count
      }
    end

    def logo
      object.logo.url
    end

    def instructions
      object.instruction_templates.map do |instruction|
        {
          name: instruction.name,
          content: Threesixty::PipedText::Perform.call!(instruction.content,
                      threesixty_campaign: object.campaign.threesixty_campaign)
        }
      end
    end

    def type
      ::Campaign::THREESIXTY
    end

    def options
      object.option
    end

    def assessment_name
      object.assessment.name
    end

    def mindmill
      object.assessment.mindmill?
    end

    def hogan
      object.assessment.hogan?
    end

    def questions_count
      object.assessment.questions.count
    end

    def timing
      object.assessment.timing
    end

    def nominations
      is_nomination_complete_hash = Threesixty::Subjects::IsNominationRequirementComplete.call!(object.campaign.threesixty_campaign, nomination_users)

      nomination_subjects.map do |subject|
        Threesixty::EndUser::CampaignNomineeSerializer.
          new(subject, current_user: current_user, is_nomination_completed: is_nomination_complete_hash[subject.user_id]).
          to_hash
      end
    end

    def nomination_users
      @nomination_users ||= nomination_subjects.map(&:user)
    end

    def nomination_subjects
      instance_options[:subjects] || []
    end

    def evaluations
      instance_options[:evaluations] || []
    end

    def reports
      instance_options[:reports] || []
    end

    def current_user
      instance_options[:current_user]
    end
  end
end
