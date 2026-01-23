# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AI::PromptTemplate::Renderer do
  let!(:user) do
    create(:user, first_name: 'John', last_name: 'Doe', email: 'john.doe@example.com')
  end
  let!(:user_profile) { create(:user_profile, user: user, locale: 'en', age: 30, gender: 'male') }
  let!(:campaign) { create(:campaign, name: 'Test Campaign', type: 'common') }
  let!(:campaign_factor_group) { create(:campaign_factor_group, name: 'Leadership', campaign: campaign) }

  let!(:campaign_factor1) do
    create(:campaign_factor,
           campaign: campaign,
           campaign_factor_group: campaign_factor_group,
           name: 'Innovation Explorer',
           code: 'innovation_explorer',
           description: 'Measures innovation capabilities',
           output_type: :numeric,
           factor_type: 'formula')
  end

  let!(:campaign_factor2) do
    create(:campaign_factor,
           campaign: campaign,
           campaign_factor_group: campaign_factor_group,
           name: 'Results Driver',
           code: 'results_driver',
           description: 'Measures results-driven behavior',
           output_type: :string,
           factor_type: 'assessment')
  end

  let!(:campaign_factor_value1) do
    create(:campaign_factor_value,
           campaign: campaign,
           user: user,
           campaign_factor: campaign_factor1,
           numeric_value: 8.5)
  end

  let!(:campaign_factor_value2) do
    create(:campaign_factor_value,
           campaign: campaign,
           user: user,
           campaign_factor: campaign_factor2,
           string_value: 'High')
  end

  describe 'available template context' do
    context 'user context' do
      it 'provides access to user attributes' do
        prompt = 'Hi {{user.first_name}} {{user.last_name}}! Your age is {{user.age}} and email is {{user.email}}.'
        result = described_class.call!(prompt, user: user)

        expect(result).to eq('Hi John Doe! Your age is 30 and email is john.doe@example.com.')
      end

      it 'provides access to user locale and language' do
        prompt = 'Language: {{user.language}}, Locale: {{user.locale}}'
        allow(I18n).to receive(:t).with('languages.en').and_return('English')

        result = described_class.call!(prompt, user: user)

        expect(result).to eq('Language: English, Locale: en')
      end
    end

    context 'campaign context' do
      it 'provides access to campaign attributes' do
        prompt = 'Campaign: {{campaign.name}} (ID: {{campaign.id}}, Type: {{campaign.type}})'
        result = described_class.call!(prompt, user: user, campaign: campaign)

        expect(result).to eq("Campaign: Test Campaign (ID: #{campaign.id}, Type: common)")
      end
    end

    context 'campaign_user context' do
      let!(:campaign_user) do
        create(:campaign_user,
               user: user,
               campaign: campaign,
               level: :guide)
      end

      it 'provides access to campaign_user level' do
        prompt = 'User {{user.full_name}} has level: {{campaign_user.level}}'
        result = described_class.call!(prompt, user: user, campaign: campaign)

        expect(result).to eq('User John Doe has level: guide')
      end

      it 'renders correctly when campaign_user does not exist' do
        other_campaign = create(:campaign, name: 'Other Campaign')
        prompt = 'Level: {{campaign_user.level}}'
        result = described_class.call!(prompt, user: user, campaign: other_campaign)

        expect(result).to eq('Level: ')
      end

      it 'works in combination with other context variables' do
        prompt = <<~PROMPT
          User: {{user.first_name}} {{user.last_name}}
          Campaign: {{campaign.name}}
          Level: {{campaign_user.level}}
        PROMPT

        result = described_class.call!(prompt, user: user, campaign: campaign)

        expect(result).to include('User: John Doe')
        expect(result).to include('Campaign: Test Campaign')
        expect(result).to include('Level: guide')
      end
    end

    context 'campaign factors context' do
      it 'provides direct access to individual factors by code' do
        prompt = <<~PROMPT
          Factor: {{campaign_factors.innovation_explorer.name}}
          Description: {{campaign_factors.innovation_explorer.description}}
          Type: {{campaign_factors.innovation_explorer.output_type}}
          Score: {{campaign_factors.innovation_explorer.value}}
        PROMPT

        result = described_class.call!(prompt, user: user, campaign: campaign)

        expected_output = <<~OUTPUT.strip
          Factor: Innovation Explorer
          Description: Measures innovation capabilities
          Type: numeric
          Score: 8.5
        OUTPUT
        expect(result.strip).to eq(expected_output)
      end

      it 'supports iteration over all factors' do
        prompt = <<~PROMPT
          {% for factor in campaign_factors %}
          - {{factor.name}}: {{factor.value}}
          {% endfor %}
        PROMPT

        result = described_class.call!(prompt, user: user, campaign: campaign)

        expect(result).to include('- Innovation Explorer: 8.5')
        expect(result).to include('- Results Driver: High')
      end

      it 'supports filtering by group using custom filter' do
        prompt = <<~PROMPT
          {% assign group_factors = campaign_factors | campaign_factors_by_group: 'Leadership' %}
          {% for factor in group_factors %}
          - {{factor.name}}: {{factor.description}} (Score: {{factor.value}})
          {% endfor %}
        PROMPT

        result = described_class.call!(prompt, user: user, campaign: campaign)

        expect(result).to include('- Innovation Explorer: Measures innovation capabilities (Score: 8.5)')
        expect(result).to include('- Results Driver: Measures results-driven behavior (Score: High)')
      end

      it 'supports filtering by codes using custom filter' do
        prompt = <<~PROMPT
          {% assign target_codes = "innovation_explorer,results_driver" %}
          {% assign filtered_factors = campaign_factors | campaign_factors_by_codes: target_codes %}
          {% for factor in filtered_factors %}
          - {{factor.name}}: {{factor.value}}
          {% endfor %}
        PROMPT

        result = described_class.call!(prompt, user: user, campaign: campaign)

        expect(result).to include('- Innovation Explorer: 8.5')
        expect(result).to include('- Results Driver: High')
      end

      it 'supports liquid built-in filters like sort' do
        prompt = <<~PROMPT
          {% assign sorted_factors_desc = campaign_factors | sort: 'name' | reverse %}
          Top factors:
          {% for factor in sorted_factors_desc %}
          - {{factor.name}}: {{factor.value}}
          {% endfor %}
        PROMPT

        result_text = described_class.call!(prompt, user: user, campaign: campaign)

        results_driver_pos = result_text.index('Results Driver')
        innovation_explorer_pos = result_text.index('Innovation Explorer')
        expect(results_driver_pos).to be < innovation_explorer_pos
      end
    end
  end

  describe 'template integration' do
    it 'renders complex template combining all available context' do
      prompt = <<~PROMPT
        User: {{user.first_name}} {{user.last_name}}
        Campaign: {{campaign.name}}

        Assessment Results:
        {% assign group_factors = campaign_factors | campaign_factors_by_group: 'Leadership' %}
        {% for factor in group_factors %}
        - {{factor.name}}: {{factor.description}} (Score: {{factor.value}})
        {% endfor %}

        Language: {{user.language}}
      PROMPT

      allow(I18n).to receive(:t).with('languages.en').and_return('English')

      result = described_class.call!(prompt, user: user, campaign: campaign)

      expect(result).to include('User: John Doe')
      expect(result).to include('Campaign: Test Campaign')
      expect(result).to include('- Innovation Explorer: Measures innovation capabilities (Score: 8.5)')
      expect(result).to include('- Results Driver: Measures results-driven behavior (Score: High)')
      expect(result).to include('Language: English')
    end
  end

  describe 'edge cases and error handling' do
    context 'when user is nil' do
      let(:prompt) { 'Hi {{user.first_name}}!' }

      it 'renders without error when user is nil' do
        result = described_class.call!(prompt, user: nil)

        expect(result).to eq('Hi Liquid error: internal!')
      end
    end

    context 'when campaign is nil' do
      let(:prompt) { 'Campaign: {{campaign.name}}' }

      it 'renders without error when campaign is nil' do
        result = described_class.call!(prompt, user: user, campaign: nil)

        expect(result).to eq('Campaign: ')
      end
    end

    context 'with invalid liquid syntax' do
      let(:prompt) { 'Hi {{user.first_name} - missing closing braces' }

      it 'handles syntax errors gracefully' do
        result = described_class.call(prompt, user: user)

        expect(result[:error]).to include('Liquid syntax error')
      end
    end

    context 'with undefined variable reference' do
      let(:prompt) { 'Hi {{user.nonexistent_field}}!' }

      it 'renders with empty value for undefined variables' do
        result = described_class.call!(prompt, user: user)

        expect(result).to eq('Hi !')
      end
    end

    context 'when parsing raises an exception' do
      let(:prompt) { 'Valid template: {{user.first_name}}' }

      it 'handles template parsing exceptions' do
        allow(Liquid::Template).to receive(:parse).and_raise(Liquid::SyntaxError.new('Liquid parsing error'))

        result = described_class.call(prompt, user: user)

        expect(result[:error]).to eq('Liquid syntax error: Liquid parsing error')
      end
    end

    context 'with filters registration' do
      let(:prompt) do
        '{% assign filtered = campaign_factors | campaign_factors_by_group: "Leadership" %}Count: {{ filtered.size }}'
      end

      it 'registers custom filters correctly' do
        result = described_class.call!(prompt, user: user, campaign: campaign)

        expect(result).to eq('Count: 2')
      end
    end
  end
end
