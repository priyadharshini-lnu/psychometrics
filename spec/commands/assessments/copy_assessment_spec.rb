# frozen_string_literal: true

require 'rails_helper'

describe Assessments::CopyAssessment do
  describe '.process!' do
    let(:client) { create(:tenancy) }
    let(:assessment) { create(:assessment, owner_id: client.id) }
    let(:block) { create(:block, assessment: assessment) }
    let(:factor) { create(:factor) }

    let(:copied_assessment) { double(:assessment) }
    let!(:user) { create(:client_admin, client: client) }

    before do
      questions = create_list(:question, 3, block: block)
      create(:translation, translateable: questions.first, resource: assessment)

      create(:factors_scoring, factor: factor, question: questions.first, assessment: assessment)
      create(:question_recoding, question: questions.first, assessment: assessment)

      flow = {
        elements: [
          { type: 'Block', elements: [], path: [0], props: { current: block.id } }
        ]
      }
      assessment.update_attribute(:flow, flow)

      display_logic = [
        {
          conditionType: 'Question',
          type: 'bool',
          subject: questions[1].id,
          answer: 0,
          predicate: 'Selected'
        }
      ]
      end_of_block_skip_logic = [
        {
          subject: questions.first.id,
          prefix: 'And',
          answer: 0,
          predicate: 'NotSelected',
          type: 'bool',
          destination: 'EndOfBlock'
        }
      ]
      destination_skip_logic = [
        {
          subject: questions.last.id,
          prefix: 'And',
          answer: '5',
          predicate: 'Selected',
          type: 'bool',
          destination: 'SpecificBlock',
          destinationBlock: block.id
        }
      ]

      questions.first.update(display_logic: display_logic, skip_logic: end_of_block_skip_logic)
      questions.last.update(skip_logic: destination_skip_logic)
    end

    let(:copy) do
      described_class.call(assessment.id, user, client.id,
                           new_assessment_name: "Copy of #{assessment.name}")[:ok][:assessment]
    end

    it 'succeeds' do
      expect(copy).to be_an_instance_of(Assessments::Common)
      expect(copy.persisted?).to be_truthy

      expect(copy.name).to eq("Copy of #{assessment.name}")
    end

    it 'saves passed assessment name' do
      assessment = create(:assessment, owner_id: client.id)
      assessment_name = Faker::Name.name
      assessment = described_class.call!(assessment.id, user, client.id,
                                         new_assessment_name: assessment_name)[:assessment]

      expect(assessment.name).to eq(assessment_name)
    end

    it 'copies all blocks' do
      expect(copy.blocks.length).to eq(assessment.blocks.length)
    end

    it 'replaces block_id in flow' do
      pattern = /"current":"?#{copy.blocks.first.id}"?/
      expect(copy.flow.to_json.match(pattern)).not_to be_nil
    end

    it 'copies all questions of each block' do
      expect(copy.blocks.first.questions.length).to eq(assessment.blocks.first.questions.length)
    end

    it 'replaces question_id in display_logic' do
      question_id = assessment.blocks.first.questions.first.id
      copied_display_logic = copy.blocks.first.questions.first.display_logic.to_json
      pattern = /"subject":#{question_id}/

      expect(copied_display_logic.match(pattern)).to be_nil
    end

    it "doesn't copy empty display_logic" do
      og_display_logic = assessment.blocks.first.questions.last.display_logic
      expect(og_display_logic).to be_nil

      co_display_logic = copy.blocks.first.questions.last.display_logic
      expect(co_display_logic).to be_nil
    end

    it 'replaces question_id in skip_logic' do
      old_question_id = assessment.questions.order(:position).first.id
      new_question_id = copy.questions.order(:position).first.id
      copied_skip_logic = copy.questions.order(:position).first.skip_logic.to_json

      old_question_id_pattern = /"subject":#{old_question_id}/
      new_question_id_pattern = /"subject":#{new_question_id}/

      expect(copied_skip_logic.match(old_question_id_pattern)).to be_nil
      expect(copied_skip_logic.match(new_question_id_pattern)).not_to be_nil
    end

    it 'replaces block_id in skip_logic' do
      old_block_id = assessment.blocks.first.id
      new_block_id = copy.blocks.first.id
      copied_skip_logic = copy.blocks.first.questions.order(:position).last.skip_logic.to_json

      old_block_id_pattern = /"destinationBlock":"?#{old_block_id}"?/
      new_block_id_pattern = /"destinationBlock":"?#{new_block_id}"?/

      expect(copied_skip_logic.match(old_block_id_pattern)).to be_nil
      expect(copied_skip_logic.match(new_block_id_pattern)).not_to be_nil
    end

    it "doesn't copy empty skip_logic" do
      og_skip_logic = assessment.questions.order(:position)[1].skip_logic
      expect(og_skip_logic).to be_nil

      co_skip_logic = copy.questions.order(:position)[1].skip_logic
      expect(co_skip_logic).to be_nil
    end

    it 'copies translations of questions' do
      expect(
        copy.blocks.first.questions.first.translations.length
      ).to eq(
        assessment.blocks.first.questions.first.translations.length
      )

      translation = copy.blocks.first.questions.first.translations.first

      expect(translation.resource_id).to eq(copy.id)
      expect(translation.translateable_id).to eq(copy.blocks.first.questions.first.id)
    end

    it 'copies factors scorings' do
      original = assessment.blocks.first.questions.first
      copied = copy.blocks.first.questions.first

      expect(original.factors_scorings.length).to eq(1)
      expect(copied.factors_scorings.length).to eq(1)
    end

    it 'copies question recodings' do
      original = assessment.blocks.first.questions.first
      copied = copy.blocks.first.questions.first

      expect(original.question_recodings.length).to eq(1)
      expect(copied.question_recodings.length).to eq(1)
    end

    it 'copies question translations' do
      translations = copy.blocks.first.questions.first.translations

      expect(translations.length).to eq(assessment.blocks.first.questions.first.translations.length)
    end

    it 'copies instruction translations' do
      Translation.create!(
        resource_type: assessment.type,
        resource_id: assessment.id,
        translateable_type: 'Instructions',
        translateable_id: 0,
        locale: 'ar',
        data: { 'props' => { 'content' => 'تعليمات التقييم' } }
      )

      copy_result = described_class.call(assessment.id, user, client.id,
                                         new_assessment_name: "Copy of #{assessment.name}")[:ok][:assessment]

      instruction_translation = Translation.find_by(
        resource_type: copy_result.type,
        resource_id: copy_result.id,
        translateable_type: 'Instructions'
      )

      expect(instruction_translation).not_to be_nil
      expect(instruction_translation.resource_id).to eq(copy_result.id)
      expect(instruction_translation.translateable_type).to eq('Instructions')
    end

    it 'copies block translations' do
      original_translation = Translation.create!(
        resource_type: assessment.type,
        resource_id: assessment.id,
        translateable_type: 'Block',
        translateable_id: block.id,
        locale: 'ar',
        data: { 'props' => { 'staticContent' => { 'value' => '<p>Arabic block content</p>' } } }
      )

      expect(original_translation).to be_persisted
      expect(original_translation.translateable_id).to eq(block.id)

      copy_result = described_class.call(assessment.id, user, client.id,
                                         new_assessment_name: "Copy of #{assessment.name}")[:ok][:assessment]

      copied_block = copy_result.blocks.first

      block_translation = Translation.find_by(
        resource_type: copy_result.type,
        resource_id: copy_result.id,
        translateable_type: 'Block',
        translateable_id: copied_block.id
      )

      expect(block_translation).not_to be_nil
      expect(block_translation.translateable_id).to eq(copied_block.id)
      expect(block_translation.resource_id).to eq(copy_result.id)
      expect(block_translation.translateable_type).to eq('Block')
    end

    it 'save TTE as owner_id when owner_id is not passed' do
      superadmin = create(:superadmin)
      copy = described_class.call!(assessment.id, superadmin, nil,
                                   new_assessment_name: "Copy of #{assessment.name}")[:assessment]

      expect(copy.owner_id).to eq(nil)
    end

    context 'with microsite_settings' do
      let(:project) { create(:project) }
      let(:microsite_settings) { { project_id: project.id, assessment_id: 'ms-product-123' } }

      let(:microsite_copy) do
        described_class.call!(
          assessment.id, user, client.id,
          new_assessment_name: "Copy of #{assessment.name}",
          microsite_settings: microsite_settings
        )[:assessment]
      end

      it 'copies the assessment as a microsite assessment' do
        persisted_copy = Assessment.find(microsite_copy.id)

        expect(persisted_copy).to be_an_instance_of(Assessments::Microsite)
        expect(persisted_copy.category).to eq(Assessment::MICROSITE)
        expect(persisted_copy.project_id).to eq(project.id)
        expect(persisted_copy.external_settings['assessment_id']).to eq('ms-product-123')
      end

      it 'seeds question_mappings from the catalog when available' do
        create(:microsite_assessment,
               project: project,
               product_id: 'ms-product-123',
               metadata: { 'questions' => { 'q-field-1' => {}, 'q-field-2' => {} } })

        copy = described_class.call!(
          assessment.id, user, client.id,
          new_assessment_name: "Copy of #{assessment.name}",
          microsite_settings: microsite_settings
        )[:assessment]

        expect(copy.external_settings['question_mappings']).to eq('q-field-1' => nil, 'q-field-2' => nil)
      end

      it 'does not set question_mappings when catalog has no questions' do
        create(:microsite_assessment,
               project: project,
               product_id: 'ms-product-123',
               metadata: { 'description' => 'no questions here' })

        copy = described_class.call!(
          assessment.id, user, client.id,
          new_assessment_name: "Copy of #{assessment.name}",
          microsite_settings: microsite_settings
        )[:assessment]

        expect(copy.external_settings).not_to have_key('question_mappings')
      end

      it 'still copies blocks and questions' do
        expect(microsite_copy.blocks.length).to eq(assessment.blocks.length)
        expect(microsite_copy.questions.length).to eq(assessment.questions.length)
      end

      context 'when the source is a microsite assessment' do
        let(:assessment) do
          create(
            :assessment, :microsite, owner_id: client.id,
                                     external_settings: {
                                       'assessment_id' => 'ms-source-product',
                                       'question_mappings' => { 'field1' => 1 }
                                     }
          )
        end

        it 'replaces the assessment_id and does not carry over source question mappings' do
          expect(microsite_copy.external_settings['assessment_id']).to eq('ms-product-123')
          expect(microsite_copy.external_settings).not_to include('question_mappings' => { 'field1' => 1 })
        end
      end
    end
  end
end
