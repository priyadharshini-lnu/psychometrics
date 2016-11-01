# == Schema Information
#
# Table name: assigns
#
#  id            :integer          not null, primary key
#  assessment_id :integer
#  user_id       :integer
#  client_id     :integer
#  results       :jsonb
#  scoring       :jsonb
#  embedded_data :jsonb
#  status        :integer          default("not_started")
#  role          :integer          default("member")
#  completed_at  :datetime
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  step          :integer
#  membership_id :integer
#

class Assign < ApplicationRecord
  belongs_to :user
  belongs_to :assessment
  belongs_to :membership
  belongs_to :client

  validates_uniqueness_of :client_id, scope: [:assessment_id, :user_id], message: :not_uniqueness

  enum status: [:not_started, :in_progress, :completed]
  enum role: [:member, :manager, :admin]

  after_initialize :init
  before_save :notification_handler

  def init
    self.status  ||= Assign.statuses['not_started']
    self.step    ||= 0
    self.scoring ||= {}
  end

  #
  # 1 step:
  # Generate hash: { factor_id: [FactorsScoring, FactorsScoring, ...], ...} - factors_scoring_map
  #
  # 2 step:
  # Generate hash from questions related with FactorsScoring: {question_id: [Question], question_id: [Question]} - questions_map
  #
  # 3 step:
  # Run through hash #1:
  #   for every factor calculate scoring by assign->results and FactorScoring->props
  #
  # 4 step:
  # Temporal result save to assign->scoring:
  # Example: {866=>{:name=>"Rubyable", :results=>[2.0, 2.5, 3.0]}, 867=>{:name=>"Reactable", :results=>[2.0, 2.5, 3.0]}}
  #
  #
  # 5 step:
  # Calculate average of field scoring[factor_id][:results]
  # Example: {866=>{:name=>"Rubyable", :results=>3.75}, 867=>{:name=>"Reactable", :results=>2.5}}
  #
  def calculate_scoring
    factors_scoring     = FactorsScoring.where(assessment_id: assessment_id).joins(:factor).all
    factors_scoring_map = factors_scoring.group_by(&:factor_id)
    questions_ids       = factors_scoring.pluck(:question_id).uniq
    questions_map       = Question.where(id: questions_ids).all.group_by(&:id)
    self.scoring        = {}

    factors_scoring_map.each do |factor_id, scoring_array|
      self.scoring[factor_id] = { name: scoring_array.first.try(:factor).try(:name), results: [] }
      scoring_array.each do |question_scoring|
        question      = questions_map[question_scoring.question_id].first
        scoring_class = "Scoring::#{question.type}"
        result        = results[question.id.to_s]
        if result && question && !question_scoring.props.empty?
          begin
            scoring_point = scoring_class.constantize.new.calculate(question, result, question_scoring.props)
            self.scoring[factor_id][:results] << scoring_point if scoring_point
          rescue
            raise "Should be implemented class #{scoring_class}"
          end
        end
      end
      if !self.scoring[factor_id][:results].empty?
        self.scoring[factor_id][:results] = self.scoring[factor_id][:results].sum.to_f / self.scoring[factor_id][:results].size
      else
        self.scoring[factor_id][:results] = 0
      end
    end
    nil
  end

  def notification_handler
    if self.status_changed?
      if in_progress?
        Notification.create(
            assessment_id: assessment_id,
            user_id: user_id,
            client_id: client_id,
            text:      I18n.t('assigns.notifications.in_progress', user_name: user.decorate.display_name, assessment_name: assessment.name)
        )
      end
      if completed?
        Notification.create(
            assessment_id: assessment_id,
            user_id: user_id,
            client_id: client_id,
            text:      I18n.t('assigns.notifications.completed', user_name: user.decorate.display_name, assessment_name: assessment.name)
        )
      end
    end
  end
end
