# frozen_string_literal: true

module Threesixty
  module PipedText
    module Branches
      module FactorFields
        class Table < ::PipedText::BaseField
          include Rails.application.routes.url_helpers

          def call
            html = <<~HTML.squish
              <table class="table table-bordered">
                <thead>
                  <tr>
                    <th>#{I18n.t('factors.factor')}</th>
                    <th>#{I18n.t('factors.description')}</th>
                  </tr>
                </thead>
                <tbody>
                  #{factor_rows.join}
                </tbody>
              </table>
            HTML

            broadcast :ok, html
          end

          def factor_rows
            factors.map do |factor|
              <<~HTML.squish
                <tr>
                  <td>#{factor.name}</td>
                  <td>#{factor.description}</td>
                </tr>
              HTML
            end
          end

          def factors
            context[:assessment].dimension.all_factors
          end
        end
      end
    end
  end
end
