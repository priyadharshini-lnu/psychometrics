# == Schema Information
#
# Table name: assigns
#
#  id                :integer          not null, primary key
#  assessment_id     :integer          not null
#  results           :jsonb
#  scoring           :jsonb
#  embedded_data     :jsonb
#  status            :integer          default("not_started")
#  role              :integer          default("member")
#  completed_at      :datetime
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#  step              :integer
#  membership_id     :integer          not null
#  norm_data         :jsonb
#  started_at        :datetime
#  agile_scoring     :jsonb
#  project_assign_id :integer
#

class Assign < ApplicationRecord
  has_one :user, through: :membership
  belongs_to :assessment
  belongs_to :membership, inverse_of: :assigns
  belongs_to :project_assign, foreign_key: :project_assign_id, class_name: 'Assign'
  has_one :original_assign, foreign_key: :project_assign_id, class_name: 'Assign'

  has_many :assigns_reports # on delete cascade
  has_many :reports, through: :assigns_reports

  validates_uniqueness_of :assessment_id, scope: [:membership_id], message: :not_uniqueness
  validates :membership, :assessment, presence: true

  validate :relevant_membership, if: 'membership.present?'
  validate :relevant_assessment, if: 'assessment.present?'
  validate :relevant_reports, if: 'report_ids.any?'

  enum status: %i(not_started in_progress completed)
  enum role: %i(member manager admin)

  scope :mindmill, lambda {
    joins(:assessment).
      where.has { |assigns| assigns.assessment.type.eq(Assessment::TYPES[:mindmill]) }
  }

  after_initialize :init
  after_create :set_project_assign
  before_save :notification_handler
  before_update :set_started_at, if: proc { status_changed? && in_progress? }
  after_destroy :clear_project_assign

  after_commit :send_completion_email, if: proc { status_previously_changed? && completed? }
  after_commit :update_membership_completed

  delegate :project_membership, to: :membership

  def set_started_at
    self.started_at = DateTime.current
    self.step = 0
  end

  def init
    self.status ||= Assign.statuses['not_started'] if respond_to? :status
    self.step ||= 0 if respond_to? :step
    self.scoring ||= {} if respond_to? :scoring
    self.agile_scoring ||= {} if respond_to? :agile_scoring
  end

  mount_base64_uploader :mindmill_report, FileUploader, file_name: proc { 'mindmill_report' }

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

  def send_completion_email
    assign = original_assign || self
    ::Communications::CompletionTypeJob.perform_later(assign)
  end

  def update_membership_completed
    return if project_membership.nil? || membership.destroyed?
    assigns = membership.reload.assigns
    completed = assigns.size.positive? && assigns.size == assigns.completed.size
    membership.update_column(:assigns_completed, completed)
  end

  def set_project_assign
    return if project_membership.nil?
    project_assign = project_membership.assigns.where(assessment_id: assessment_id).take
    unless project_assign
      project_assign = dup
      project_assign.membership_id = project_membership.id
      project_assign.save!
    end
    update_column(:project_assign_id, project_assign.id)
  end

  def clear_project_assign
    return if project_assign.nil? || project_membership.clients_assigns.pluck('assigns.assessment_id').include?(assessment_id)
    project_assign.destroy!
  end

  def relevant_membership
    errors.add(:membership) if membership.scope == :administration
  end

  def relevant_assessment
    errors.add(:assessment) if membership.client.assessment_ids.exclude? assessment_id
  end

  def relevant_reports
    errors.add(:reports) if (membership.client.report_ids & assessment.report_ids & report_ids).to_set != report_ids.to_set
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
