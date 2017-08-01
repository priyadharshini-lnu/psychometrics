# == Schema Information
#
# Table name: reports
#
#  id            :integer          not null, primary key
#  assessment_id :integer
#  name          :string
#  disabled      :boolean          default(FALSE)
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  type          :integer          default("common")
#  owner_id      :integer
#

class Report < ApplicationRecord
  include Copyable

  TYPES = [
    COMMON_TYPE = 'common'.freeze,
    YTI_TYPE = 'yti'.freeze,
    ETI_TYPE = 'eti'.freeze
  ].freeze

  self.inheritance_column = :_type_disabled

  belongs_to :assessment
  belongs_to :owner, class_name: 'Client', foreign_key: :owner_id
  has_and_belongs_to_many :report_families

  has_many :pages, class_name: 'Reports::Page', dependent: :destroy
  has_many :filters, class_name: 'Reports::Filter', dependent: :destroy
  has_many :clients_reports # on delete cascade
  has_many :clients, through: :clients_reports
  has_many :translations, as: :resource
  has_many :product_reports, dependent: :destroy
  has_many :products, through: :product_reports
  has_many :assigns_reports # on delete restrict

  validates :assessment, presence: true
  validates :owner, presence: true, allow_nil: true
  validates :report_families, presence: true, allow_nil: false

  enum type: TYPES

  # Copy report with pages => modules
  def clone
    @cloned_item = deep_clone include: [:report_families, { pages: :modules }]
    @cloned_item.gen_uniq_name
    @cloned_item
  end

  scope :enabled, -> { where.not(disabled: true) }
  scope :with_owner, -> (owner_id) { where(owner_id: owner_id) }
  scope :with_report_families, lambda { |report_family_ids|
    report_family_ids.blank? ? none : joins(:report_families).where(report_families: { id: report_family_ids })
  }

  # Search entity by assessment category
  scope :with_assessment_category, lambda { |assessment_category|
    assessment_category == 'all' ? all : joins(:assessment).where(assessments: { category: assessment_category })
  }

  # Search entity by assessment
  scope :with_assessment, lambda { |assessment_id|
    where(assessment_id: assessment_id)
  }

  scope :available_to_view, lambda {
    joins(:assessment).where.has { assessment.access_reports_at.eq(nil) | (assessment.access_reports_at <= Time.now) }
  }

  scope :for_clients, lambda { |client_ids|
    joins(:clients_reports).where.has { clients_reports.client_id.in(client_ids) }
  }

  scope :yti_eti, -> { where(type: [YTI_TYPE, ETI_TYPE]) }

  def yti_eti?
    [Report::YTI_TYPE, Report::ETI_TYPE].include? type
  end
end
