# == Schema Information
#
# Table name: tasks
#
#  id                   :integer          not null, primary key
#  membership_id        :integer
#  factor_id            :integer
#  assessment_id        :integer
#  name                 :string
#  description          :text
#  priority             :integer
#  status               :integer
#  planned_completed_at :datetime
#  completed_at         :datetime
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  parent_id            :integer
#

class Task < ApplicationRecord
  # STATUSES constant
  STATUSES = [:not_started, :in_progress, :completed].freeze
  # PRIORITIES constant High, Medium, Low
  PRIORITIES = [:low, :medium, :high].freeze

  enum status: STATUSES
  enum priority: PRIORITIES

  scope :roots, -> { where(parent_id: nil) }
  scope :no_roots, -> { where.not(parent_id: nil) }
  belongs_to :membership
  belongs_to :owner, class_name: 'Membership', foreign_key: :owner_id
  belongs_to :factor
  belongs_to :assessment
  belongs_to :parent, class_name: 'Task'
  has_many :sub_tasks, foreign_key: :parent_id, class_name: 'Task', dependent: :destroy
  has_many :comments, as: :commentable
  validates :priority, :factor_id, :membership_id, presence: true, if: :root?
  validates :name, :assessment_id, :planned_completed_at, presence: true
  validates :name, length: { maximum: 150 }, allow_blank: true

  before_create :init
  before_update :completion_callback, if: proc { status_changed? && completed? }
  after_save :status_changed_callback, if: proc { status_changed? && !root? }

  def overdue?
    if completed_at  && completed?
      planned_completed_at < completed_at
    else
      planned_completed_at < Date.today
    end
  end

  def children
    Task.where(parent_id: id).all
  end

  def root?
    !self.parent_id
  end

  #
  # Return hash statuses for input tasks. key is status name, value is array of statuses (similar as group_by, but we have virtual status: overdue)
  # @param [Tasks[]] tasks
  #
  # @return [Hash]
  #
  def self.group_by_status(tasks)
    tasks.inject({}) do |map, task|
      if task.overdue?
        map['overdue'] = [] unless map['overdue']
        map['overdue'] << task
      else
        map[task.status] = [] unless map[task.status]
        map[task.status] << task
      end
      map
    end
  end

  private

  def init
    self.status = Task.statuses[:in_progress] unless self.status
  end

  def completion_callback
    self.completed_at = Date.today
  end

  def status_changed_callback
    sub_tasks = parent.sub_tasks.all
    parent.status = :in_progress
    parent.status = :not_started if sub_tasks.all? { |t| t.status == 'not_started' }
    parent.status = :completed if sub_tasks.all? { |t| t.status == 'completed' }
    parent.save
  end
end
