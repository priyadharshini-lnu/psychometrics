# frozen_string_literal: true

class Task < ApplicationRecord
  # STATUSES constant
  STATUSES = { not_started: 0, in_progress: 1, completed: 2 }.freeze
  # PRIORITIES constant High, Medium, Low
  PRIORITIES = { low: 0, medium: 1, high: 2 }.freeze

  enum status: STATUSES
  enum priority: PRIORITIES

  scope :roots, -> { where(parent_id: nil) }
  scope :no_roots, -> { where.not(parent_id: nil) }

  belongs_to :membership
  belongs_to :owner, class_name: 'Membership'
  belongs_to :factor
  belongs_to :assessment
  belongs_to :parent, class_name: 'Task'

  has_many :sub_tasks, foreign_key: :parent_id, class_name: 'Task', dependent: :destroy
  has_many :comments, as: :commentable

  validates :priority, :factor_id, :membership_id, presence: true, if: :root?
  validates :name, :assessment_id, :planned_completed_at, presence: true
  validates :name, length: { maximum: 150 }, allow_blank: true

  before_create :init
  before_update :completion_callback, if: proc { will_save_change_to_status? && completed? }
  after_save :status_changed_callback, if: proc { saved_change_to_status? && !root? }

  def overdue?
    planned_completed_at < if completed_at && completed?
                             completed_at
                           else
                             Time.zone.today
                           end
  end

  def children
    Task.where(parent_id: id).all
  end

  def root?
    !parent_id
  end

  #
  # Return hash statuses for input tasks. key is status name, value is array of statuses (similar as group_by,
  # but we have virtual status: overdue)
  # @param [Tasks[]] tasks
  #
  # @return [Hash]
  #
  def self.group_by_status(tasks)
    tasks.each_with_object({}) do |task, map|
      if task.overdue?
        map['overdue'] = [] unless map['overdue']
        map['overdue'] << task
      else
        map[task.status] = [] unless map[task.status]
        map[task.status] << task
      end
    end
  end

  private

  def init
    self.status = Task.statuses[:not_started] unless status
  end

  def completion_callback
    self.completed_at = Time.zone.today
  end

  def status_changed_callback
    sub_tasks = parent.sub_tasks.all
    parent.status = :in_progress
    parent.status = :not_started if sub_tasks.all? { |t| t.status == 'not_started' }
    parent.status = :completed if sub_tasks.all? { |t| t.status == 'completed' }
    parent.save
  end
end
