# frozen_string_literal: true

module Campaigns
  module TextModuleOverrides
    class Approve < BaseCommand
      private_attr_reader :params, :editor

      def initialize(params, editor)
        @params = params
        @editor = editor
      end

      def call
        if params[:id]
          @result = TextModuleOverride.find(params[:id])
          @result.update(approved: true)
        else
          form = ::Campaigns::TextModuleOverrides::CreateForm.from_params(
            params.merge(editor_id: editor.id, approved: true)
          )
          @result = TextModuleOverride.find_by(module_id: form.module_id, user_report_id: form.user_report_id)
          @result ||= TextModuleOverride.create!(form.attributes)
        end
        broadcast :ok, @result
      end
    end
  end
end
