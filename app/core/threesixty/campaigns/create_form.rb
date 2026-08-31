# frozen_string_literal: true

module Threesixty
  module Campaigns
    class CreateForm < Rectify::Form
      attribute :name, String
      attribute :threesixty_type, String
      attribute :campaign_template_id, Integer
      attribute :assessment_id, Integer
      attribute :factors, Array
      attribute :questions, Array
      attribute :status, String, default: 'active'
      attribute :threesixty_category, String, default: 'normal'
      attribute :default_assessment_locale, String
      attribute :default_report_language, String
      attribute :tag_list, Array
      attribute :name_locale, String
      attribute :translated_name, String

      validates :name, :threesixty_type, presence: true
      validates :threesixty_category, inclusion: { in: %w[normal skill_rater] }
      validates :campaign_template_id, presence: true, if: -> { threesixty_type == Threesixty::Campaign::STANDARD_360 }
      validates :default_assessment_locale, absence: true, if: lambda {
        [Threesixty::Campaign::STANDARD_360, Threesixty::Campaign::PREVIOUS_360].include?(threesixty_type)
      }
      validates :default_report_language, absence: true, if: lambda {
        [Threesixty::Campaign::STANDARD_360, Threesixty::Campaign::PREVIOUS_360].include?(threesixty_type)
      }
      validates :assessment_id, presence: true, if: -> { threesixty_type == Threesixty::Campaign::PREVIOUS_360 }

      def skill_rater?
        threesixty_category == 'skill_rater'
      end
    end
  end
end
