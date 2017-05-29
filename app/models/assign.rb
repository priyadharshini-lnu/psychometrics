# == Schema Information
#
# Table name: assigns
#
#  id            :integer          not null, primary key
#  assessment_id :integer
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
#  norm_data     :jsonb
#  agile_scoring :jsonb
#  started_at    :datetime
#

class Assign < ApplicationRecord
  has_one :user, through: :membership
  belongs_to :assessment
  belongs_to :membership, inverse_of: :assigns
  has_many :assigns_reports, dependent: :destroy
  has_many :reports, through: :assigns_reports

  validates_uniqueness_of :assessment_id, scope: [:membership_id], message: :not_uniqueness

  enum status: [:not_started, :in_progress, :completed]
  enum role: [:member, :manager, :admin]

  after_initialize :init
  before_save :notification_handler

  before_update :completion_callback, if: proc { status_changed? && completed? }
  before_update :set_started_at, if: proc { status_changed? && in_progress? }

  after_commit :update_membership_completed

  def completion_callback
    ::Communications::AfterCompleteJob.perform_later(id)
  end

  def set_started_at
    self.started_at = DateTime.now
    self.step = 0
  end

  def init
    self.status ||= Assign.statuses['not_started'] if respond_to? :status
    self.step ||= 0 if respond_to? :step
    self.scoring ||= {} if respond_to? :scoring
    self.agile_scoring ||= {} if respond_to? :agile_scoring
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
    raise 'To calculate you need to pass relative assessment' unless completed?
    factors_scoring = FactorsScoring.where(assessment_id: assessment_id).joins(:factor).all
    factors_scoring_map = factors_scoring.group_by(&:factor_id)
    questions_ids = factors_scoring.pluck(:question_id).uniq
    questions_map = Question.where(id: questions_ids).all.group_by(&:id)
    self.scoring = {}
    self.agile_scoring = {}

    factors_scoring_map.each do |factor_id, scoring_array|
      self.scoring[factor_id] = { name: scoring_array.try(:first).try(:factor).try(:name), results: [] }
      self.agile_scoring[factor_id] = { name: scoring_array.try(:first).try(:factor).try(:name), results: [] }
      scoring_array.each do |question_scoring|
        question = questions_map[question_scoring.question_id].try(:first)
        scoring_class = "Scoring::#{question.try(:type)}"
        result = results[question.try(:id).try(:to_s)]
        if result && question && !question_scoring.props.empty?
          scoring_point = scoring_class.constantize.new.calculate(question, result, question_scoring.props)
          # type 'PickGroupRank' is used for agile methodology
          # for common scoring we need to skip this type
          if question.try(:type) == 'PickGroupRank'
            self.agile_scoring[factor_id][:results] << { question_id: question.id, value: scoring_point } if scoring_point
          else
            self.scoring[factor_id][:results] << { question_id: question.id, value: scoring_point } if scoring_point
          end
        end
      end
    end
    nil
  end

  def notification_handler
    if status_changed?
      if in_progress?
        Notification.create(
            assessment_id: assessment_id,
            membership_id: membership_id,
            text: I18n.t('assigns.notifications.in_progress', user_name: user.decorate.display_name, assessment_name: assessment.name)
        )
      end
      if completed?
        Notification.create(
            assessment_id: assessment_id,
            membership_id: membership_id,
            text: I18n.t('assigns.notifications.completed', user_name: user.decorate.display_name, assessment_name: assessment.name)
        )
      end
    end
  end

  def encode_id
    self.class.encode_id id
  end

  def norm_type
    return norm_data['type'] if norm_data && norm_data['id'] && norm_data['type']
    nil
  end

  private

  def update_membership_completed
    assigns = membership.reload.assigns
    completed = assigns.size == assigns.completed.size
    membership.update_column(:assigns_completed, completed)
  end

  class << self
    def encode_id(id)
      hashids = Hashids.new(ENV['HASHIDS_SALT'], Settings.hashids_length.assign_id)
      hashids.encode(id)
    end

    def decode_id(id)
      hashids = Hashids.new(ENV['HASHIDS_SALT'], Settings.hashids_length.assign_id)
      hashids.decode(id)
    end

    def find_by_encoded_id(hash_id)
      decoded_id = decode_id(hash_id).try(:first)
      find(decoded_id)
    end
  end
end
