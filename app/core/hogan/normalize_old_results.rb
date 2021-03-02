# frozen_string_literal: true

module Hogan
  class NormalizeOldResults < BaseCommand
    private_attr_reader :old_results

    def initialize(old_results)
      @old_results = old_results
    end

    def call
      return broadcast :ok, {} unless old_results.present?

      score = old_results.dig('participant', 'assessment', 'score') || []
      return broadcast :ok, old_results unless score.present?

      scores = {
        'percentileScores' => {
          'scaleScores' => normalize(find_list(score, 'percentile', 'scale'), 'scale'),
          'subscaleScores' => normalize(find_list(score, 'percentile', 'subscale'), 'subscale')
        },
        'rawScores' => {
          'scaleScores' => normalize(find_list(score, 'RAW', 'scale'), 'scale'),
          'subscaleScores' => normalize(find_list(score, 'RAW', 'subscale'), 'subscale')
        }
      }

      broadcast :ok, {
        'clientId' => old_results.dig('participant', 'clientdetails', 'clientid'),
        'groupName' => old_results.dig('participant', 'clientdetails', 'groupname'),
        'clientUserId' => old_results.dig('participant', 'clientdetails', 'clientuserid'),
        'participantId' => old_results.dig('participant', 'demographic', 'hoganuserid'),
        'empId' => old_results.dig('participant', 'demographic', 'ParticipantID'),
        'assessmentId' => old_results.dig('participant', 'assessment', 'type'),
        'assessmentFormId' => nil,
        'normId' => old_results.dig('participant', 'assessment', 'norms', '__content__'),
        'assessmentDate' => old_results.dig('participant', 'assessment', 'assessmentdate', '__content__'),
        'scores' => scores,
        'messageType' => '',
        'text' => '',
        'hasSignature' => {
          'createdBy' => nil,
          'createdDate' => nil,
          'producedBy' => nil,
          'requestedBy' => old_results.dig('participant', 'clientdetails', 'clientuserid'),
          'requestedIpAddress' => nil,
          'requestId' => nil
        }
      }
    end

    private

    def normalize(list, subtype)
      list.map do |item|
        {
          'id' => item['id'].to_i,
          "#{subtype}Name" => item['type'],
          "#{subtype}Score" => item['__content__']
        }
      end
    end

    def find_list(score, type, subtype)
      list = score.find { |item| item['type'] == type } || {}
      Array.wrap(list.dig(ActiveSupport::Inflector.pluralize(subtype), subtype) || [])
    end
  end
end
