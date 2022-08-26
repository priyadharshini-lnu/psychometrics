# frozen_string_literal: true

module Projects
  class NormalizeApiRequest < BaseCommand
    private_attr_accessor :params

    def initialize(params)
      @params = params.to_h
    end

    def call # rubocop:disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
      res = params.clone
      res['number'] = (res.delete 'client_reference') if res.key?('client_reference')
      res['privacy_consent'] = res.delete 'data_processing_consent' if res.key?('data_processing_consent')
      res['strong_password_enabled'] = res.delete 'enable_strong_password' if res.key?('enable_strong_password')
      res['two_factor_enabled'] = res.delete 'enable_2factor_auth' if res.key?('enable_2factor_auth')
      res['logo'] = res.delete 'project_logo' if res.key?('project_logo')
      res['secondary_logo'] = res.delete 'partner_logo' if res.key?('partner_logo')
      res['background'] = res.delete 'background_image' if res.key?('background_image')
      res['parent_id'] = res.delete 'client_id' if res.key?('client_id')
      res['login_box_position'] = 'auto' if res.key?('login_box_position') && res['login_box_position'] == 'center'

      broadcast :ok, res
    end
  end
end
