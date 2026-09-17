# frozen_string_literal: true

module Communications
  module Emails
    # Renders the subject/body for a CommunicationEmail (legacy Communication-sourced or
    # CommunicationDelivery-sourced) without sending anything. Handles piped-text token
    # replacement, Mustache interpolation and RTL/Arabic styling detection — logic that used
    # to live directly on CommunicationEmailMailer.
    class RenderContent < BaseCommand
      private_attr_reader :communication_email, :locale, :data

      def initialize(communication_email, locale: nil, data: {})
        @communication_email = communication_email
        @locale = locale || I18n.default_locale
        @data = data || {}
      end

      def call
        broadcast(:ok, OpenStruct.new(subject: rendered_subject, body: rendered_body, rtl: rtl?)) # rubocop:disable Style/OpenStructUse
      end

      private

      def content_source
        @content_source ||= communication_email.content_source
      end

      def rtl?
        return @rtl if defined?(@rtl)

        @rtl = locale.to_s == 'ar' && content_source.has_arabic_translation?
      end

      def rendered_subject
        subject_content = content_source.subject(locale)
        Mustache.render(replace_piped_texts(subject_content), data.slice(:first_name, :last_name))
      end

      def rendered_body
        body_content = content_source.body(locale)
        rendered = Mustache.render(replace_piped_texts(body_content), data)

        return rendered unless rtl? && rendered.present?

        apply_rtl_styling(rendered)
      end

      def apply_rtl_styling(content)
        unless content.include?('dir=')
          content = %(<div dir="rtl" style="text-align: start; direction: rtl;">#{content}</div>)
        end

        content = content.gsub(/<p(?!\s[^>]*dir=)/i,
                               '<p dir="rtl" style="text-align: start; direction: rtl;"')
        content.gsub(/<div(?!\s[^>]*dir=)/i,
                     '<div dir="rtl" style="text-align: start; direction: rtl;"')
      end

      def replace_piped_texts(content)
        Communications::PipedText::Perform.call!(
          content,
          {
            workshop: communication_email.workshop,
            workshop_invite: communication_email.workshop_invite,
            user: communication_email.user || communication_email.campaign_user&.user,
            campaign: communication_email.project_campaign,
            user_report: user_report
          }.compact
        )
      end

      def user_report
        communication_email.communication_email_resources.find { |r| r.resource_type == 'UserReport' }&.resource
      end
    end
  end
end
