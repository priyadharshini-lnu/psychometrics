class Assign < ApplicationRecord
  belongs_to :user
  belongs_to :assessment
  belongs_to :client

  validates_uniqueness_of :client_id, scope: [:assessment_id, :user_id]

  enum status: [:not_started, :in_progress, :completed]
  enum role: [:member, :manager, :admin]

  after_initialize :init

  def init
    self.status  ||= Assign.statuses['not_started']
    self.step    ||= 0
    self.scoring ||= {}
  end

  def calculate_scoring
    factors_scoring     = FactorsScoring.where(assessment_id: assessment_id).all
    factors_scoring_map = factors_scoring.group_by(&:factor_id)
    questions_ids       = factors_scoring.pluck(:question_id).uniq
    questions_map       = Question.where(id: questions_ids).all.group_by(&:id)
    self.scoring        = {}
    factors_scoring_map.each do |factor_id, scoring_array|
      self.scoring[factor_id] = []
      scoring_array.each do |question_scoring|
        question      = questions_map[question_scoring.question_id].first
        scoring_class = "Scoring::#{question.type}"
        result        = results[question.id.to_s]
        if result && question
          begin
            scoring_point = scoring_class.constantize.new.calculate(question, result, question_scoring)
            self.scoring[factor_id] << scoring_point if scoring_point
          rescue
            # TODO uncomment row below
            # raise "Should be implemented class #{scoring_class}"
          end
        end
      end
      scoring_result          = self.scoring[factor_id].sum.to_f / self.scoring[factor_id].size
      self.scoring[factor_id] = scoring_result if scoring_result
    end
    nil
  end
end
