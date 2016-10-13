# == Schema Information
#
# Table name: results
#
#  id            :integer          not null, primary key
#  status        :string
#  step          :integer
#  props         :json
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  user_id       :integer
#  client_id     :integer
#  assessment_id :integer
#
class Result < ApplicationRecord
  belongs_to :assessment
  belongs_to :client
  belongs_to :user

  STATUSES = {
      not_started: 'not_started',
      in_progress: 'in_progress',
      complete:    'complete'
  }.freeze

  enum status: STATUSES

  after_initialize :init

  def init
    self.status ||= Result.statuses['not_started']
    self.step   ||= 0
    self.scoring ||= {}
  end

  def calculate_scoring
    factors_scoring     = FactorsScoring.where(assessment_id: assessment_id).all
    factors_scoring_map = factors_scoring.group_by(&:factor_id)
    questions_ids       = factors_scoring.pluck(:question_id).uniq
    questions_map       = Question.where(id: questions_ids).all.group_by(&:id)
    # puts " questions_map #{questions_map}"
    # puts " factors_scoring_map #{factors_scoring_map}"
    factors_scoring_map.each do |factor_id, scoring_array|
      self.scoring[factor_id] = []
      scoring_array.each do |question_scoring|
        question      = questions_map[question_scoring.question_id].try(:[], 0)
        scoring_class = "Scoring::#{question.type}"
        unless Object.const_defined?(scoring_class)
          Rails.logger.error "Should be implemented class #{scoring_class}"
        end
        result = props[question.id.to_s]

        if result && question
          self.scoring[factor_id] << scoring_class.constantize.new.calculate(question, result, question_scoring)
        end
      end
      scoring_result = self.scoring[factor_id].inject { |sum, el| sum + el }.to_f / self.scoring[factor_id].size
      self.scoring[factor_id] = scoring_result if scoring_result
    end
    puts " self.scoring #{self.scoring}"
  end

end
