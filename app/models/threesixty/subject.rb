module Threesixty
  class Subject < ApplicationRecord
    include Threesixty::Participatable

    has_many :participants, foreign_key: :subject_id, primary_key: :user_id
    belongs_to :self_evaluator, foreign_key: :user_id, primary_key: :user_id, inverse_of: :self_subject, class_name: 'Threesixty::Evaluator'
    has_many :subjects_relationships, primary_key: :user_id

    enum report_approval_status: { waiting: 0, approved: 1, denied: 2 }, _prefix: :report
    enum report_release_status: { waiting: 0, released: 1, on_hold: 2}, _prefix: :report_status
    enum evaluation_status: { in_progress: 0, completed: 1 }, _prefix: :evaluation_status

    def evaluators
      participants.includes(:relationship, :subject, :evaluator).where(campaign_id: campaign_id)
    end
  end
end


# module Threesixty
#   class GetSubjectsForSubjectsReminder
#   attr_reader :threesixty_campaign, :subjects

#   def initailize(threesixty_campaign)
#     @threesixty_campaign = threesixty_campaign
#     @subjects = Threesixty::Subject.where(campaign_id: threesixty_campaign.campaign_id).includes(:user)
#   end

#   def call
#     subject_evaluator_counters = ::Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!(
#       subjects.map(&:user_id),
#       threesixty_campaign
#     )
#     nomination_requirement_by_user_id = ::Threesixty::NominationRequirements::FindForUsers.call!(
#       subjects.map(&:user),
#       threesixty_campaign
#     )
#     valid_statuses =[Threesixty::Participants::GetStatus::COMPLETED, Threesixty::Participants::GetStatus::DONE]
#     subjects.select do |subject|
#       nomination_requirement[subject.user_id]
#       status = Threesixty::Participants::GetStatus.call!(
#         subject,
#         nomination_requirement_by_user_id[subject.user_id],
#         subject_evaluator_counters[subject.user_id]
#       )
#       valid_statuses.include?(status)
#     end
#   end
# end

# module Threesixty
#   class GetEvaluatorsForEvaluatorsReminder
#     attr_reader :threesixty_campaign, :evaluators

#     def initailize(threesixty_campaign)
#       @threesixty_campaign = threesixty_campaign
#       @evaluators = Threesixty::Evaluator.where(campaign_id: threesixty_campaign.campaign_id).includes(:user)
#     end

#     def call
#       subject_evaluator_counters = ::Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!(
#         evaluators.map(&:user_id),
#         threesixty_campaign
#       )
#       nomination_requirement_by_user_id = ::Threesixty::NominationRequirements::FindForUsers.call!(
#         evaluators.map(&:user),
#         threesixty_campaign
#       )
#       valid_statuses =[Threesixty::Participants::GetStatus::COMPLETED, Threesixty::Participants::GetStatus::DONE]

#       evaluators.select do |subject|
#         nomination_requirement[subject.user_id]
#         status = Threesixty::Participants::GetStatus.call!(
#           subject,
#           nomination_requirement_by_user_id[subject.user_id],
#           subject_evaluator_counters[subject.user_id]
#         )
#         valid_statuses.include?(status)
#       end
#     end
#   end
# end

