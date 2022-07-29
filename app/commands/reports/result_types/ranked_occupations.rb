# frozen_string_literal: true

module Reports
  module ResultTypes
    class RankedOccupations < BaseType
      def call
        user_result = context.find_user_result_by(data['assessmentId'])
        ranked_occupation = get_occupation(user_result) if user_result
        occupation = Occupation.find_by(id: ranked_occupation['id']) if ranked_occupation

        {
          key: ranked_occupation&.dig('id'),
          name: occupation&.decorate&.display_name,
          config_data: data,
          value: ranked_occupation&.dig('value')
        }
      end

      private

      attr_accessor :ranked_occupation, :occupation

      # Fetchs and sorts occupations
      #
      def get_occupation(user_result)
        sorted_occupations = (user_result.occupations || []).sort_by { |occupation| occupation['value'] }
        sorted_occupations.reverse! if data['order'] == 'desc'

        sorted_occupations.at(data['position'] - 1) || {}
      end

      # Gets occupations from DB and groups it by ID
      #
      def get_occupation_from_db(ranked_occupation)
        Occupation.find_by(id: ranked_occupation['id'])
      end
    end
  end
end
