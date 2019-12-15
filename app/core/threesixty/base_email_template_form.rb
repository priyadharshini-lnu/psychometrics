# frozen_string_literal: true

module Threesixty
  class BaseEmailTemplateForm < Rectify::Form
    attribute :from, String
    attribute :reply_to_email, String
    attribute :subject, String
    attribute :content, String
    attribute :consolidated, Boolean, default: false

    validates :from, :reply_to_email, presence: true
    validates :reply_to_email, format: { with: Devise.email_regexp }, allow_blank: true
    validate :validate_consolidatable_email_content

    def validate_consolidatable_email_content
      return unless Threesixty::Emails::Name.consolidatable_email?(email_name)

      consolidated ? validate_consolidated_pipetext : validate_unconsolidated_pipetext
    end

    private

    def validate_consolidated_pipetext
      invalid_pipetexts = content.scan(%r{{{s:\/.*?}}})
      return if invalid_pipetexts.empty?

      errors.add(:content,
                 I18n.t('activemodel.errors.models.email_template.attributes.content.invalid_consolidated_pipetext',
                        invalid_pipetexts: invalid_pipetexts.join(', ')))
    end

    def validate_unconsolidated_pipetext
      invalid_pipetexts = content.scan(%r{{{st:\/.*?}}})
      return if invalid_pipetexts.empty?

      errors.add(:content,
                 I18n.t('activemodel.errors.models.email_template.attributes.content.invalid_unconsolidated_pipetext',
                        invalid_pipetexts: invalid_pipetexts.join(', ')))
    end

    def email_name
      raise NoMethodError
    end
  end
end
